/// Thin `#[tauri::command]` wrappers calling `couture_core`.
use std::collections::HashMap;
use std::sync::Mutex;

use couture_core::db::Database;
use couture_core::measurements::{self, FullMeasurements, Person};
use couture_core::patterns::corset::{CorsetControlParameters, CorsetMeasurements, CorsetPattern};
use couture_core::patterns::sleeve::{SleeveControlParameters, SleeveMeasurements, SleevePattern};
use couture_core::schemas::{
    GarmentInfo, GarmentSelectionResponse, PatternRequest, PatternResponse, PatternTypeInfo,
    PieceInfo, SavedMeasurementsResponse,
};
use couture_core::shop;

/// Managed app state holding the database connection.
pub struct AppState {
    pub db: Mutex<Database>,
}

// -- Measurement commands (no DB) --

#[tauri::command]
pub fn fetch_sizes() -> Vec<i32> {
    vec![34, 36, 38, 40, 42, 44, 46, 48]
}

#[tauri::command]
pub fn fetch_default_measurements(size: i32) -> Result<FullMeasurements, String> {
    if ![34, 36, 38, 40, 42, 44, 46, 48].contains(&size) {
        return Err(format!("Size {} not available", size));
    }
    Ok(measurements::default_measurements(size))
}

#[tauri::command]
pub fn fetch_presets() -> Vec<String> {
    vec!["kwama".to_string(), "vivien".to_string()]
}

#[tauri::command]
pub fn fetch_preset_measurements(person: String) -> Result<FullMeasurements, String> {
    let p = Person::from_str(&person).ok_or_else(|| format!("Preset '{}' not found", person))?;
    Ok(measurements::individual_measurements(p))
}

// -- Measurement commands (DB) --

#[tauri::command]
pub fn get_measurements(state: tauri::State<'_, AppState>) -> Result<SavedMeasurementsResponse, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    match db.get_measurements().map_err(|e| e.to_string())? {
        Some(saved) => Ok(saved),
        None => {
            // Return defaults for size 38
            let fm = measurements::default_measurements(38);
            let values = full_measurements_to_map(&fm);
            Ok(SavedMeasurementsResponse {
                size: 38,
                values,
                idk: HashMap::new(),
            })
        }
    }
}

#[tauri::command]
pub fn save_measurements(
    state: tauri::State<'_, AppState>,
    size: i32,
    values: HashMap<String, f64>,
    idk: Option<HashMap<String, bool>>,
) -> Result<SavedMeasurementsResponse, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let idk = idk.unwrap_or_default();
    db.save_measurements(size, &values, &idk)
        .map_err(|e| e.to_string())
}

// -- Shop commands --

#[tauri::command]
pub fn fetch_garments() -> Vec<GarmentInfo> {
    shop::garment_catalog()
}

#[tauri::command]
pub fn fetch_pieces() -> Vec<PieceInfo> {
    shop::all_pieces()
}

#[tauri::command]
pub fn get_selections(state: tauri::State<'_, AppState>) -> Result<Vec<GarmentSelectionResponse>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_selections().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_selection(state: tauri::State<'_, AppState>, garment_name: String) -> Result<GarmentSelectionResponse, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.add_selection(&garment_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_selection(state: tauri::State<'_, AppState>, garment_name: String) -> Result<bool, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.remove_selection(&garment_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_adjustments(
    state: tauri::State<'_, AppState>,
    garment_name: String,
    adjustments: HashMap<String, serde_json::Value>,
) -> Result<GarmentSelectionResponse, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_adjustments(&garment_name, &adjustments)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Selection not found".to_string())
}

// -- Pattern commands --

#[tauri::command]
pub fn fetch_pattern_types() -> Vec<PatternTypeInfo> {
    shop::pattern_type_catalog()
}

#[tauri::command]
pub fn generate_pattern(request: PatternRequest) -> Result<PatternResponse, String> {
    match request.pattern_type.as_str() {
        "corset" => {
            let fm = map_to_full_measurements(&request.measurements)?;
            let cm = CorsetMeasurements::from_full(&fm);

            let mut control = CorsetControlParameters::default();
            if let Some(ref params) = request.control_parameters {
                if let Some(&v) = params.get("front_neck_center") { control.front_neck_center = v; }
                if let Some(&v) = params.get("back_neck_center") { control.back_neck_center = v; }
                if let Some(&v) = params.get("front_neck_top") { control.front_neck_top = v; }
                if let Some(&v) = params.get("back_neck_top") { control.back_neck_top = v; }
                if let Some(&v) = params.get("armhole_curve") { control.armhole_curve = v; }
            }

            let mut pattern = CorsetPattern::new(cm, control);

            if let Some(ref stretch) = request.stretch {
                pattern.stretch(stretch.horizontal, stretch.vertical, stretch.usage)
                    .map_err(|e| e.to_string())?;
            }

            let construction_svg = pattern.render_svg("construction");
            let pattern_svg = pattern.render_svg("pattern");

            Ok(PatternResponse {
                construction_svg,
                pattern_svg,
                warnings: vec![],
            })
        }
        "sleeve" => {
            let sm = if request.measurements.contains_key("armhole_depth") {
                SleeveMeasurements {
                    armhole_depth: *request.measurements.get("armhole_depth").unwrap_or(&21.5),
                    armhole_measurement: *request.measurements.get("armhole_measurement").unwrap_or(&39.5),
                    sleeve_length: *request.measurements.get("sleeve_length").unwrap_or(&60.0),
                    upper_arm_to_elbow: *request.measurements.get("upper_arm_to_elbow").unwrap_or(&35.0),
                    sleeve_bottom_width: *request.measurements.get("sleeve_bottom_width").unwrap_or(&20.0),
                }
            } else {
                let fm = map_to_full_measurements(&request.measurements)?;
                SleeveMeasurements::from_full(&fm)
            };

            let mut control = SleeveControlParameters::default();
            if let Some(ref params) = request.control_parameters {
                if let Some(&v) = params.get("g3_perpendicular") { control.g3_perpendicular = v; }
                if let Some(&v) = params.get("h3_perpendicular") { control.h3_perpendicular = v; }
            }

            let mut pattern = SleevePattern::new(sm, control);

            if let Some(ref stretch) = request.stretch {
                pattern.stretch(stretch.horizontal, stretch.vertical, stretch.usage)
                    .map_err(|e| e.to_string())?;
            }

            let construction_svg = pattern.render_svg("construction");
            let pattern_svg = pattern.render_svg("pattern");

            Ok(PatternResponse {
                construction_svg,
                pattern_svg,
                warnings: vec![],
            })
        }
        _ => Err(format!("Unknown pattern type: {}", request.pattern_type)),
    }
}

// -- Helpers --

fn get_f64(map: &HashMap<String, f64>, key: &str) -> Result<f64, String> {
    map.get(key)
        .copied()
        .ok_or_else(|| format!("Missing measurement: {}", key))
}

fn map_to_full_measurements(m: &HashMap<String, f64>) -> Result<FullMeasurements, String> {
    Ok(FullMeasurements {
        back_waist_length:        get_f64(m, "back_waist_length")?,
        front_waist_length:       get_f64(m, "front_waist_length")?,
        full_bust:                get_f64(m, "full_bust")?,
        bust_height:              get_f64(m, "bust_height")?,
        half_bust_point_distance: get_f64(m, "half_bust_point_distance")?,
        full_waist:               get_f64(m, "full_waist")?,
        small_hip:                get_f64(m, "small_hip")?,
        full_hip:                 get_f64(m, "full_hip")?,
        neck_circumference:       get_f64(m, "neck_circumference")?,
        half_back_width:          get_f64(m, "half_back_width")?,
        half_front_width:         get_f64(m, "half_front_width")?,
        shoulder_length:          get_f64(m, "shoulder_length")?,
        armhole_circumference:    get_f64(m, "armhole_circumference")?,
        underarm_height:          get_f64(m, "underarm_height")?,
        arm_length:               get_f64(m, "arm_length")?,
        upper_arm:                get_f64(m, "upper_arm")?,
        elbow_height:             get_f64(m, "elbow_height")?,
        wrist:                    get_f64(m, "wrist")?,
        waist_to_hip:             get_f64(m, "waist_to_hip")?,
        crotch_depth:             get_f64(m, "crotch_depth")?,
        crotch_length:            get_f64(m, "crotch_length")?,
        waist_to_knee:            get_f64(m, "waist_to_knee")?,
        waist_to_floor:           get_f64(m, "waist_to_floor")?,
        side_waist_to_floor:      get_f64(m, "side_waist_to_floor")?,
    })
}

fn full_measurements_to_map(fm: &FullMeasurements) -> HashMap<String, f64> {
    let mut m = HashMap::new();
    m.insert("back_waist_length".into(),        fm.back_waist_length);
    m.insert("front_waist_length".into(),       fm.front_waist_length);
    m.insert("full_bust".into(),                fm.full_bust);
    m.insert("bust_height".into(),              fm.bust_height);
    m.insert("half_bust_point_distance".into(), fm.half_bust_point_distance);
    m.insert("full_waist".into(),               fm.full_waist);
    m.insert("small_hip".into(),                fm.small_hip);
    m.insert("full_hip".into(),                 fm.full_hip);
    m.insert("neck_circumference".into(),       fm.neck_circumference);
    m.insert("half_back_width".into(),          fm.half_back_width);
    m.insert("half_front_width".into(),         fm.half_front_width);
    m.insert("shoulder_length".into(),          fm.shoulder_length);
    m.insert("armhole_circumference".into(),    fm.armhole_circumference);
    m.insert("underarm_height".into(),          fm.underarm_height);
    m.insert("arm_length".into(),               fm.arm_length);
    m.insert("upper_arm".into(),                fm.upper_arm);
    m.insert("elbow_height".into(),             fm.elbow_height);
    m.insert("wrist".into(),                    fm.wrist);
    m.insert("waist_to_hip".into(),             fm.waist_to_hip);
    m.insert("crotch_depth".into(),             fm.crotch_depth);
    m.insert("crotch_length".into(),            fm.crotch_length);
    m.insert("waist_to_knee".into(),            fm.waist_to_knee);
    m.insert("waist_to_floor".into(),           fm.waist_to_floor);
    m.insert("side_waist_to_floor".into(),      fm.side_waist_to_floor);
    m
}
