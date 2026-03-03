use std::collections::HashMap;
use crate::math::Point2;

/// Base for patterns with fabric stretch support.
///
/// Uses composition: pattern types embed this struct and delegate
/// point storage / stretch operations to it.
pub struct StretchBase {
    pub stretched: bool,
    pub h_factor: f64,
    pub v_factor: f64,
    pub points: HashMap<String, Point2>,
    pub helper_points: HashMap<String, Point2>,
}

impl StretchBase {
    pub fn new() -> Self {
        Self {
            stretched: false,
            h_factor: 1.0,
            v_factor: 1.0,
            points: HashMap::new(),
            helper_points: HashMap::new(),
        }
    }

    /// Apply stretch factors in place.
    ///
    /// * `horizontal` — fabric horizontal stretch capacity (0.0 = none, 1.0 = 100%).
    /// * `vertical` — fabric vertical stretch capacity.
    /// * `usage` — how much of the stretch to use (0.5 = 50% for comfort).
    pub fn stretch(&mut self, horizontal: f64, vertical: f64, usage: f64) -> Result<(), String> {
        if self.stretched {
            return Err("Cannot stretch a pattern that is already stretched.".to_string());
        }
        let h = 1.0 / (1.0 + horizontal * usage);
        let v = 1.0 / (1.0 + vertical * usage);
        self.h_factor = h;
        self.v_factor = v;
        for pt in self.points.values_mut() {
            pt[0] *= h;
            pt[1] *= v;
        }
        for pt in self.helper_points.values_mut() {
            pt[0] *= h;
            pt[1] *= v;
        }
        self.stretched = true;
        Ok(())
    }
}
