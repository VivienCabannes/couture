/// SQLite persistence layer for measurements and garment selections.
use rusqlite::{params, Connection, Result as SqlResult};
use std::collections::HashMap;

use crate::schemas::{GarmentSelectionResponse, SavedMeasurementsResponse};

/// Database handle wrapping a SQLite connection.
pub struct Database {
    conn: Connection,
}

impl Database {
    /// Open (or create) a database at the given path.
    ///
    /// Pass `":memory:"` for an in-memory database (useful for tests).
    pub fn open(path: &str) -> SqlResult<Self> {
        let conn = Connection::open(path)?;
        let db = Database { conn };
        db.create_tables()?;
        Ok(db)
    }

    fn create_tables(&self) -> SqlResult<()> {
        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS measurements (
                id INTEGER PRIMARY KEY DEFAULT 1,
                size INTEGER DEFAULT 38,
                'values' TEXT,
                idk TEXT
            );
            CREATE TABLE IF NOT EXISTS garment_selections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                garment_name TEXT UNIQUE NOT NULL,
                added_at REAL NOT NULL,
                adjustments TEXT DEFAULT '{}'
            );"
        )?;
        Ok(())
    }

    /// Get saved measurements, or `None` if nothing saved.
    pub fn get_measurements(&self) -> SqlResult<Option<SavedMeasurementsResponse>> {
        let mut stmt = self.conn.prepare(
            "SELECT size, \"values\", idk FROM measurements WHERE id = 1"
        )?;
        let mut rows = stmt.query_map([], |row| {
            let size: i32 = row.get(0)?;
            let values_json: String = row.get(1)?;
            let idk_json: Option<String> = row.get(2)?;
            Ok((size, values_json, idk_json))
        })?;

        if let Some(row) = rows.next() {
            let (size, values_json, idk_json) = row?;
            let values: HashMap<String, f64> =
                serde_json::from_str(&values_json).unwrap_or_default();
            let idk: HashMap<String, bool> = idk_json
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default();
            Ok(Some(SavedMeasurementsResponse { size, values, idk }))
        } else {
            Ok(None)
        }
    }

    /// Save measurements (upsert singleton row id=1).
    pub fn save_measurements(
        &self,
        size: i32,
        values: &HashMap<String, f64>,
        idk: &HashMap<String, bool>,
    ) -> SqlResult<SavedMeasurementsResponse> {
        let values_json = serde_json::to_string(values).unwrap();
        let idk_json = serde_json::to_string(idk).unwrap();

        // Try update first, then insert if no rows affected
        let updated = self.conn.execute(
            "UPDATE measurements SET size = ?1, \"values\" = ?2, idk = ?3 WHERE id = 1",
            params![size, values_json, idk_json],
        )?;

        if updated == 0 {
            self.conn.execute(
                "INSERT INTO measurements (id, size, \"values\", idk) VALUES (1, ?1, ?2, ?3)",
                params![size, values_json, idk_json],
            )?;
        }

        Ok(SavedMeasurementsResponse {
            size,
            values: values.clone(),
            idk: idk.clone(),
        })
    }

    /// Get all garment selections ordered by `added_at`.
    pub fn get_selections(&self) -> SqlResult<Vec<GarmentSelectionResponse>> {
        let mut stmt = self.conn.prepare(
            "SELECT garment_name, added_at, adjustments FROM garment_selections ORDER BY added_at"
        )?;
        let rows = stmt.query_map([], |row| {
            let garment_name: String = row.get(0)?;
            let added_at: f64 = row.get(1)?;
            let adj_json: Option<String> = row.get(2)?;
            Ok((garment_name, added_at, adj_json))
        })?;

        let mut results = Vec::new();
        for row in rows {
            let (garment_name, added_at, adj_json) = row?;
            let adjustments = adj_json
                .and_then(|s| serde_json::from_str(&s).ok());
            results.push(GarmentSelectionResponse {
                garment_name,
                added_at,
                adjustments,
            });
        }
        Ok(results)
    }

    /// Add a garment to selections (idempotent — returns existing if already present).
    pub fn add_selection(&self, garment_name: &str) -> SqlResult<GarmentSelectionResponse> {
        // Check if already exists
        let mut stmt = self.conn.prepare(
            "SELECT garment_name, added_at, adjustments FROM garment_selections WHERE garment_name = ?1"
        )?;
        let mut rows = stmt.query_map(params![garment_name], |row| {
            let name: String = row.get(0)?;
            let added_at: f64 = row.get(1)?;
            let adj_json: Option<String> = row.get(2)?;
            Ok((name, added_at, adj_json))
        })?;

        if let Some(row) = rows.next() {
            let (name, added_at, adj_json) = row?;
            let adjustments = adj_json.and_then(|s| serde_json::from_str(&s).ok());
            return Ok(GarmentSelectionResponse {
                garment_name: name,
                added_at,
                adjustments,
            });
        }

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64();

        self.conn.execute(
            "INSERT INTO garment_selections (garment_name, added_at, adjustments) VALUES (?1, ?2, '{}')",
            params![garment_name, now],
        )?;

        Ok(GarmentSelectionResponse {
            garment_name: garment_name.to_string(),
            added_at: now,
            adjustments: Some(HashMap::new()),
        })
    }

    /// Remove a garment from selections. Returns `true` if a row was deleted.
    pub fn remove_selection(&self, garment_name: &str) -> SqlResult<bool> {
        let deleted = self.conn.execute(
            "DELETE FROM garment_selections WHERE garment_name = ?1",
            params![garment_name],
        )?;
        Ok(deleted > 0)
    }

    /// Update per-piece adjustments for a selected garment.
    pub fn save_adjustments(
        &self,
        garment_name: &str,
        adjustments: &HashMap<String, serde_json::Value>,
    ) -> SqlResult<Option<GarmentSelectionResponse>> {
        let adj_json = serde_json::to_string(adjustments).unwrap();
        let updated = self.conn.execute(
            "UPDATE garment_selections SET adjustments = ?1 WHERE garment_name = ?2",
            params![adj_json, garment_name],
        )?;
        if updated == 0 {
            return Ok(None);
        }

        // Re-read to return updated state
        let mut stmt = self.conn.prepare(
            "SELECT garment_name, added_at, adjustments FROM garment_selections WHERE garment_name = ?1"
        )?;
        let mut rows = stmt.query_map(params![garment_name], |row| {
            let name: String = row.get(0)?;
            let added_at: f64 = row.get(1)?;
            let adj_json: Option<String> = row.get(2)?;
            Ok((name, added_at, adj_json))
        })?;

        if let Some(row) = rows.next() {
            let (name, added_at, adj_json) = row?;
            let adjustments = adj_json.and_then(|s| serde_json::from_str(&s).ok());
            Ok(Some(GarmentSelectionResponse {
                garment_name: name,
                added_at,
                adjustments,
            }))
        } else {
            Ok(None)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_db_measurements_round_trip() {
        let db = Database::open(":memory:").unwrap();

        // Initially no measurements
        assert!(db.get_measurements().unwrap().is_none());

        // Save measurements
        let mut values = HashMap::new();
        values.insert("full_bust".to_string(), 88.0);
        values.insert("full_waist".to_string(), 68.0);
        let mut idk = HashMap::new();
        idk.insert("full_bust".to_string(), false);

        let saved = db.save_measurements(38, &values, &idk).unwrap();
        assert_eq!(saved.size, 38);
        assert_eq!(saved.values["full_bust"], 88.0);

        // Read back
        let loaded = db.get_measurements().unwrap().unwrap();
        assert_eq!(loaded.size, 38);
        assert_eq!(loaded.values["full_bust"], 88.0);
        assert_eq!(loaded.idk["full_bust"], false);

        // Update
        values.insert("full_bust".to_string(), 92.0);
        let updated = db.save_measurements(40, &values, &idk).unwrap();
        assert_eq!(updated.size, 40);
        assert_eq!(updated.values["full_bust"], 92.0);
    }

    #[test]
    fn test_db_selections_round_trip() {
        let db = Database::open(":memory:").unwrap();

        // Initially empty
        let sels = db.get_selections().unwrap();
        assert!(sels.is_empty());

        // Add
        let s = db.add_selection("top").unwrap();
        assert_eq!(s.garment_name, "top");

        // Idempotent add
        let s2 = db.add_selection("top").unwrap();
        assert_eq!(s2.added_at, s.added_at);

        // List
        let sels = db.get_selections().unwrap();
        assert_eq!(sels.len(), 1);

        // Save adjustments
        let mut adj = HashMap::new();
        adj.insert("corset".to_string(), serde_json::json!({"fit": "tight"}));
        let updated = db.save_adjustments("top", &adj).unwrap();
        assert!(updated.is_some());

        // Remove
        assert!(db.remove_selection("top").unwrap());
        assert!(!db.remove_selection("nonexistent").unwrap());

        let sels = db.get_selections().unwrap();
        assert!(sels.is_empty());
    }
}
