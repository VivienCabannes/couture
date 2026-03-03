/// Serde structs matching the Python Pydantic schemas for API compatibility.
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// -- Measurements schemas --

/// Full body measurements response (mirrors Python MeasurementsResponse).
pub type MeasurementsResponse = crate::measurements::FullMeasurements;

/// Request body for saving user measurements.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedMeasurementsRequest {
    #[serde(default = "default_size")]
    pub size: i32,
    pub values: HashMap<String, f64>,
    pub idk: Option<HashMap<String, bool>>,
}

fn default_size() -> i32 {
    38
}

/// Response for saved measurements.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedMeasurementsResponse {
    pub size: i32,
    pub values: HashMap<String, f64>,
    pub idk: HashMap<String, bool>,
}

// -- Pattern schemas --

/// Stretch input for fabric stretch adjustment.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StretchInput {
    #[serde(default)]
    pub horizontal: f64,
    #[serde(default)]
    pub vertical: f64,
    #[serde(default = "default_usage")]
    pub usage: f64,
}

fn default_usage() -> f64 {
    1.0
}

/// Pattern generation request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternRequest {
    pub pattern_type: String,
    pub measurements: HashMap<String, f64>,
    pub control_parameters: Option<HashMap<String, f64>>,
    pub stretch: Option<StretchInput>,
    #[serde(default = "default_output_format")]
    pub output_format: String,
}

fn default_output_format() -> String {
    "all".to_string()
}

/// Pattern generation response (SVG output).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternResponse {
    pub construction_svg: String,
    pub pattern_svg: String,
    #[serde(default)]
    pub warnings: Vec<String>,
}

// -- Shop schemas --

/// A single pattern piece within a garment.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PieceInfo {
    pub pattern_type: String,
    pub label: String,
}

/// A garment type with its constituent pattern pieces.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GarmentInfo {
    pub name: String,
    pub label: String,
    pub pieces: Vec<PieceInfo>,
}

/// A selected garment with its adjustments.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GarmentSelectionResponse {
    pub garment_name: String,
    pub added_at: f64,
    pub adjustments: Option<HashMap<String, serde_json::Value>>,
}

// -- Pattern type metadata --

/// Definition of a control parameter for a pattern type.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlParameterDefinition {
    pub name: String,
    pub default: f64,
    pub description: String,
}

/// Definition of a required measurement field for a pattern type.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeasurementFieldDefinition {
    pub name: String,
    pub description: String,
}

/// Metadata about a pattern type (required measurements, control params, etc.).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternTypeInfo {
    pub name: String,
    pub label: String,
    pub required_measurements: Vec<MeasurementFieldDefinition>,
    pub control_parameters: Vec<ControlParameterDefinition>,
    pub supports_stretch: bool,
}
