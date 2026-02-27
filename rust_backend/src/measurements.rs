/// Complete body measurements in centimeters (French sizing table).
///
/// Field numbering follows the French pattern-drafting standard:
/// 1–24 as listed in the comments below.
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FullMeasurements {
    pub back_waist_length: f64,        // 1. Longueur taille dos
    pub front_waist_length: f64,       // 2. Longueur taille devant
    pub full_bust: f64,                // 3. Tour de poitrine
    pub bust_height: f64,              // 4. Hauteur de poitrine
    pub half_bust_point_distance: f64, // 5. 1/2 écart de poitrine
    pub full_waist: f64,               // 6. Tour de taille
    pub small_hip: f64,                // 7. Tour des petites hanches
    pub full_hip: f64,                 // 8. Tour de bassin
    pub neck_circumference: f64,       // 9. Tour d'encollure
    pub half_back_width: f64,          // 10. 1/2 carrure dos
    pub half_front_width: f64,         // 11. 1/2 carrure devant
    pub shoulder_length: f64,          // 12. Longueur d'épaule
    pub armhole_circumference: f64,    // 13. Tour d'emmanchure
    pub underarm_height: f64,          // 14. Hauteur dessous de bras
    pub arm_length: f64,               // 15. Longueur de bras
    pub upper_arm: f64,                // 16. Grosseur de bras
    pub elbow_height: f64,             // 17. Hauteur coude
    pub wrist: f64,                    // 18. Tour de poignet
    pub waist_to_hip: f64,             // 19. Hauteur taille-bassin
    pub crotch_depth: f64,             // 20. Hauteur de montant
    pub crotch_length: f64,            // 21. Enfourchure
    pub waist_to_knee: f64,            // 22. Hauteur taille au genou
    pub waist_to_floor: f64,           // 23. Hauteur taille à terre
    pub side_waist_to_floor: f64,      // 24. Hauteur taille côté à terre
}

/// French sizing table: (base T38, increment per size step).
///
/// Each step is 2 units of size (e.g. T36 → T38 is one step).
struct SizeEntry {
    base: f64,
    incr: f64,
}

const SIZE_TABLE: &[(&str, SizeEntry)] = &[
    ("back_waist_length",        SizeEntry { base: 41.0,  incr: 0.5  }),
    ("front_waist_length",       SizeEntry { base: 37.0,  incr: 0.5  }),
    ("full_bust",                SizeEntry { base: 88.0,  incr: 4.0  }),
    ("bust_height",              SizeEntry { base: 22.0,  incr: 0.5  }),
    ("half_bust_point_distance", SizeEntry { base: 9.25,  incr: 0.25 }),
    ("full_waist",               SizeEntry { base: 68.0,  incr: 4.0  }),
    ("small_hip",                SizeEntry { base: 85.0,  incr: 4.0  }),
    ("full_hip",                 SizeEntry { base: 94.0,  incr: 4.0  }),
    ("neck_circumference",       SizeEntry { base: 36.0,  incr: 1.0  }),
    ("half_back_width",          SizeEntry { base: 17.5,  incr: 0.25 }),
    ("half_front_width",         SizeEntry { base: 16.5,  incr: 0.25 }),
    ("shoulder_length",          SizeEntry { base: 12.0,  incr: 0.4  }),
    ("armhole_circumference",    SizeEntry { base: 39.5,  incr: 1.0  }),
    ("underarm_height",          SizeEntry { base: 21.5,  incr: 0.25 }),
    ("arm_length",               SizeEntry { base: 60.0,  incr: 0.0  }),
    ("upper_arm",                SizeEntry { base: 26.0,  incr: 1.0  }),
    ("elbow_height",             SizeEntry { base: 35.0,  incr: 0.0  }),
    ("wrist",                    SizeEntry { base: 16.0,  incr: 0.25 }),
    ("waist_to_hip",             SizeEntry { base: 22.0,  incr: 0.0  }),
    ("crotch_depth",             SizeEntry { base: 26.5,  incr: 0.5  }),
    ("crotch_length",            SizeEntry { base: 60.0,  incr: 2.0  }),
    ("waist_to_knee",            SizeEntry { base: 58.0,  incr: 1.0  }),
    ("waist_to_floor",           SizeEntry { base: 105.0, incr: 0.5  }),
    ("side_waist_to_floor",      SizeEntry { base: 105.5, incr: 1.0  }),
];

/// Return `FullMeasurements` for a standard French size (T34–T48).
///
/// Computes each measurement as `base + incr * ((size - 38) / 2)`.
pub fn default_measurements(size: i32) -> FullMeasurements {
    let size_diff = (size - 38) / 2;
    let val = |name: &str| -> f64 {
        SIZE_TABLE
            .iter()
            .find(|(n, _)| *n == name)
            .map(|(_, e)| e.base + e.incr * size_diff as f64)
            .unwrap()
    };

    FullMeasurements {
        back_waist_length:        val("back_waist_length"),
        front_waist_length:       val("front_waist_length"),
        full_bust:                val("full_bust"),
        bust_height:              val("bust_height"),
        half_bust_point_distance: val("half_bust_point_distance"),
        full_waist:               val("full_waist"),
        small_hip:                val("small_hip"),
        full_hip:                 val("full_hip"),
        neck_circumference:       val("neck_circumference"),
        half_back_width:          val("half_back_width"),
        half_front_width:         val("half_front_width"),
        shoulder_length:          val("shoulder_length"),
        armhole_circumference:    val("armhole_circumference"),
        underarm_height:          val("underarm_height"),
        arm_length:               val("arm_length"),
        upper_arm:                val("upper_arm"),
        elbow_height:             val("elbow_height"),
        wrist:                    val("wrist"),
        waist_to_hip:             val("waist_to_hip"),
        crotch_depth:             val("crotch_depth"),
        crotch_length:            val("crotch_length"),
        waist_to_knee:            val("waist_to_knee"),
        waist_to_floor:           val("waist_to_floor"),
        side_waist_to_floor:      val("side_waist_to_floor"),
    }
}

/// Known individuals with saved body measurements.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Person {
    Kwama,
    Vivien,
}

impl Person {
    /// Parse a person name string (case-insensitive).
    pub fn from_str(s: &str) -> Option<Person> {
        match s.to_lowercase().as_str() {
            "kwama" => Some(Person::Kwama),
            "vivien" => Some(Person::Vivien),
            _ => None,
        }
    }
}

/// Return `FullMeasurements` for a specific individual.
pub fn individual_measurements(person: Person) -> FullMeasurements {
    match person {
        Person::Vivien => FullMeasurements {
            back_waist_length:        43.5,
            front_waist_length:       39.5,
            full_bust:                102.0,
            bust_height:              22.0,
            half_bust_point_distance: 11.0,
            full_waist:               83.0,
            small_hip:                94.0,
            full_hip:                 101.0,
            neck_circumference:       40.0,
            half_back_width:          19.5,
            half_front_width:         18.5,
            shoulder_length:          13.0,
            armhole_circumference:    50.0,
            underarm_height:          22.5,
            arm_length:               66.0,
            upper_arm:                33.0,
            elbow_height:             40.0,
            wrist:                    17.5,
            waist_to_hip:             25.0,
            crotch_depth:             32.0,
            crotch_length:            85.0,
            waist_to_knee:            67.0,
            waist_to_floor:           126.0,
            side_waist_to_floor:      127.0,
        },
        Person::Kwama => FullMeasurements {
            back_waist_length:        40.5,
            front_waist_length:       36.5,
            full_bust:                90.0,
            bust_height:              22.0,
            half_bust_point_distance: 9.5,
            full_waist:               73.0,
            small_hip:                80.5,
            full_hip:                 100.0,
            neck_circumference:       36.0,
            half_back_width:          17.5,
            half_front_width:         16.5,
            shoulder_length:          12.0,
            armhole_circumference:    40.0,
            underarm_height:          22.0,
            arm_length:               60.0,
            upper_arm:                28.0,
            elbow_height:             33.0,
            wrist:                    15.0,
            waist_to_hip:             22.0,
            crotch_depth:             26.5,
            crotch_length:            62.0,
            waist_to_knee:            58.0,
            waist_to_floor:           105.0,
            side_waist_to_floor:      106.0,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_t38() {
        let m = default_measurements(38);
        assert!((m.full_bust - 88.0).abs() < 1e-10);
        assert!((m.full_waist - 68.0).abs() < 1e-10);
        assert!((m.back_waist_length - 41.0).abs() < 1e-10);
    }

    #[test]
    fn test_default_t36() {
        let m = default_measurements(36);
        // One step down: bust = 88 - 4 = 84
        assert!((m.full_bust - 84.0).abs() < 1e-10);
    }

    #[test]
    fn test_default_t40() {
        let m = default_measurements(40);
        // One step up: bust = 88 + 4 = 92
        assert!((m.full_bust - 92.0).abs() < 1e-10);
    }

    #[test]
    fn test_individual_vivien() {
        let m = individual_measurements(Person::Vivien);
        assert!((m.full_bust - 102.0).abs() < 1e-10);
        assert!((m.arm_length - 66.0).abs() < 1e-10);
    }

    #[test]
    fn test_individual_kwama() {
        let m = individual_measurements(Person::Kwama);
        assert!((m.full_bust - 90.0).abs() < 1e-10);
        assert!((m.wrist - 15.0).abs() < 1e-10);
    }

    #[test]
    fn test_person_from_str() {
        assert_eq!(Person::from_str("kwama"), Some(Person::Kwama));
        assert_eq!(Person::from_str("Vivien"), Some(Person::Vivien));
        assert_eq!(Person::from_str("unknown"), None);
    }
}
