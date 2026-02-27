/// Static garment catalog and pattern type metadata.

use crate::schemas::{
    ControlParameterDefinition, GarmentInfo, MeasurementFieldDefinition, PatternTypeInfo, PieceInfo,
};

/// Return the garment catalog (garment types with their pattern pieces).
pub fn garment_catalog() -> Vec<GarmentInfo> {
    vec![GarmentInfo {
        name: "top".to_string(),
        label: "Top / Bodice Block".to_string(),
        pieces: vec![
            PieceInfo {
                pattern_type: "corset".to_string(),
                label: "Bodice".to_string(),
            },
            PieceInfo {
                pattern_type: "sleeve".to_string(),
                label: "Sleeve".to_string(),
            },
        ],
    }]
}

/// Return a flat list of all individual pattern pieces.
pub fn all_pieces() -> Vec<PieceInfo> {
    garment_catalog()
        .into_iter()
        .flat_map(|g| g.pieces)
        .collect()
}

/// Return metadata for all available pattern types.
pub fn pattern_type_catalog() -> Vec<PatternTypeInfo> {
    vec![
        PatternTypeInfo {
            name: "corset".to_string(),
            label: "Corset / Bodice Block".to_string(),
            required_measurements: vec![
                MeasurementFieldDefinition { name: "back_waist_length".into(), description: "Longueur taille dos".into() },
                MeasurementFieldDefinition { name: "front_waist_length".into(), description: "Longueur taille devant".into() },
                MeasurementFieldDefinition { name: "full_bust".into(), description: "Tour de poitrine".into() },
                MeasurementFieldDefinition { name: "bust_height".into(), description: "Hauteur de poitrine".into() },
                MeasurementFieldDefinition { name: "half_bust_point_distance".into(), description: "1/2 écart de poitrine".into() },
                MeasurementFieldDefinition { name: "full_waist".into(), description: "Tour de taille".into() },
                MeasurementFieldDefinition { name: "small_hip".into(), description: "Tour des petites hanches".into() },
                MeasurementFieldDefinition { name: "full_hip".into(), description: "Tour de bassin".into() },
                MeasurementFieldDefinition { name: "neck_circumference".into(), description: "Tour d'encollure".into() },
                MeasurementFieldDefinition { name: "half_back_width".into(), description: "1/2 carrure dos".into() },
                MeasurementFieldDefinition { name: "half_front_width".into(), description: "1/2 carrure devant".into() },
                MeasurementFieldDefinition { name: "shoulder_length".into(), description: "Longueur d'épaule".into() },
                MeasurementFieldDefinition { name: "underarm_height".into(), description: "Hauteur dessous de bras".into() },
                MeasurementFieldDefinition { name: "waist_to_hip".into(), description: "Hauteur taille-bassin".into() },
            ],
            control_parameters: vec![
                ControlParameterDefinition { name: "front_neck_center".into(), default: 0.8, description: "Ratio for front neck center Bezier control".into() },
                ControlParameterDefinition { name: "back_neck_center".into(), default: 0.5, description: "Ratio for back neck center Bezier control".into() },
                ControlParameterDefinition { name: "front_neck_top".into(), default: 0.34, description: "Ratio for front neck top Bezier control".into() },
                ControlParameterDefinition { name: "back_neck_top".into(), default: 0.20, description: "Ratio for back neck top Bezier control".into() },
                ControlParameterDefinition { name: "armhole_curve".into(), default: 0.4, description: "Ratio for armhole curve offset".into() },
            ],
            supports_stretch: true,
        },
        PatternTypeInfo {
            name: "sleeve".to_string(),
            label: "Jersey Set-In Sleeve".to_string(),
            required_measurements: vec![
                MeasurementFieldDefinition { name: "armhole_depth".into(), description: "Profondeur d'emmanchure".into() },
                MeasurementFieldDefinition { name: "armhole_measurement".into(), description: "Mesure d'emmanchure totale".into() },
                MeasurementFieldDefinition { name: "sleeve_length".into(), description: "Longueur de manche".into() },
                MeasurementFieldDefinition { name: "upper_arm_to_elbow".into(), description: "Distance épaule-coude".into() },
                MeasurementFieldDefinition { name: "sleeve_bottom_width".into(), description: "Largeur bas de manche".into() },
            ],
            control_parameters: vec![
                ControlParameterDefinition { name: "g3_perpendicular".into(), default: 1.0, description: "Perpendicular offset for G3 (cm)".into() },
                ControlParameterDefinition { name: "h3_perpendicular".into(), default: 1.5, description: "Perpendicular offset for H3 (cm)".into() },
            ],
            supports_stretch: true,
        },
    ]
}
