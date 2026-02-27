/// Jersey set-in sleeve block pattern drafting.
///
/// Constructs a one-piece sleeve from armhole measurements using
/// French pattern drafting methods with spline curve interpolation.

use crate::math::{self, Point2};
use crate::measurements::FullMeasurements;
use crate::patterns::stretch::StretchBase;
use crate::renderers::svg::SVGRenderer;

/// Measurements required for the jersey set-in sleeve block.
#[derive(Debug, Clone)]
pub struct SleeveMeasurements {
    pub armhole_depth: f64,
    pub armhole_measurement: f64,
    pub sleeve_length: f64,
    pub upper_arm_to_elbow: f64,
    pub sleeve_bottom_width: f64,
}

impl SleeveMeasurements {
    /// Derive sleeve measurements from full body measurements.
    pub fn from_full(fm: &FullMeasurements) -> Self {
        Self {
            armhole_depth: fm.underarm_height,
            armhole_measurement: fm.armhole_circumference,
            sleeve_length: fm.arm_length,
            upper_arm_to_elbow: fm.elbow_height,
            sleeve_bottom_width: fm.wrist,
        }
    }
}

/// Control parameters for sleeve cap curve construction.
#[derive(Debug, Clone)]
pub struct SleeveControlParameters {
    pub g3_perpendicular: f64,
    pub h3_perpendicular: f64,
}

impl Default for SleeveControlParameters {
    fn default() -> Self {
        Self {
            g3_perpendicular: 1.0,
            h3_perpendicular: 1.5,
        }
    }
}

/// Jersey set-in sleeve block pattern.
pub struct SleevePattern {
    pub base: StretchBase,
    pub m: SleeveMeasurements,
    pub c: SleeveControlParameters,
    pub bounds: (f64, f64, f64, f64),
}

impl SleevePattern {
    pub fn new(measurements: SleeveMeasurements, control: SleeveControlParameters) -> Self {
        let mut pat = SleevePattern {
            base: StretchBase::new(),
            m: measurements,
            c: control,
            bounds: (0.0, 0.0, 0.0, 0.0),
        };
        pat.build_construction_points();
        pat.build_bezier_helper_points();
        pat.compute_bounds();
        pat
    }

    /// Apply stretch to all points.
    pub fn stretch(&mut self, horizontal: f64, vertical: f64, usage: f64) -> Result<(), String> {
        self.base.stretch(horizontal, vertical, usage)
    }

    fn pt(&self, name: &str) -> Point2 {
        self.base.points[name]
    }

    fn build_construction_points(&mut self) {
        let width = 0.75 * self.m.armhole_measurement + 1.0;
        let length = self.m.sleeve_length;
        let cap_height = (2.0 / 3.0) * self.m.armhole_depth;

        let pts = &mut self.base.points;
        pts.insert("A".into(), [0.0, 0.0]);
        pts.insert("B".into(), [width, 0.0]);
        pts.insert("C".into(), [0.0, length]);
        pts.insert("D".into(), [width, length]);
        pts.insert("E".into(), [width / 2.0, 0.0]);
        pts.insert("F".into(), [width / 2.0, length]);
        pts.insert("I".into(), [0.0, cap_height]);
        pts.insert("I'".into(), [width, cap_height]);

        let half_wrist = self.m.sleeve_bottom_width / 2.0;
        pts.insert("F1".into(), [width / 2.0 - half_wrist, length]);
        pts.insert("F2".into(), [width / 2.0 + half_wrist, length]);
    }

    fn build_bezier_helper_points(&mut self) {
        let width = self.pt("B")[0];
        let cap_height = self.pt("I")[1];

        let g_x = width / 4.0;
        self.base.helper_points.insert("G".into(), [g_x, 0.0]);
        self.base.helper_points.insert("G1".into(), [g_x, cap_height]);

        let h_x = width / 2.0 + width / 4.0;
        self.base.helper_points.insert("H".into(), [h_x, 0.0]);
        self.base.helper_points.insert("H1".into(), [h_x, cap_height]);

        self.base.points.insert("G2".into(), [g_x, cap_height / 3.0]);
        self.base.points.insert("H2".into(), [h_x, cap_height / 2.0]);

        // G3: halfway between G2 and I, perpendicular offset
        let g2 = self.pt("G2");
        let i_pt = self.pt("I");
        let mid_g2_i = math::lerp(g2, i_pt, 0.5);
        let vec_i_g2 = math::sub(g2, i_pt);
        let norm_i_g2 = math::normalize(vec_i_g2);
        let perp_i_g2 = math::perp(norm_i_g2);
        self.base.points.insert(
            "G3".into(),
            math::add(mid_g2_i, math::scale(self.c.g3_perpendicular, perp_i_g2)),
        );

        // H3: halfway between H2 and I', perpendicular offset
        let h2 = self.pt("H2");
        let ip = self.pt("I'");
        let mid_h2_ip = math::lerp(h2, ip, 0.5);
        let vec_h2_ip = math::sub(ip, h2);
        let norm_h2_ip = math::normalize(vec_h2_ip);
        let perp_h2_ip = math::perp(norm_h2_ip);
        self.base.points.insert(
            "H3".into(),
            math::add(mid_h2_ip, math::scale(self.c.h3_perpendicular, perp_h2_ip)),
        );

        let elbow_y = self.m.upper_arm_to_elbow;
        self.base.helper_points.insert("J".into(), [0.0, elbow_y]);
        self.base.helper_points.insert("J'".into(), [width, elbow_y]);
    }

    fn compute_bounds(&mut self) {
        let all_pts: Vec<Point2> = self
            .base
            .points
            .values()
            .chain(self.base.helper_points.values())
            .copied()
            .collect();
        let xs: Vec<f64> = all_pts.iter().map(|p| p[0]).collect();
        let ys: Vec<f64> = all_pts.iter().map(|p| p[1]).collect();
        self.bounds = (
            xs.iter().cloned().fold(f64::INFINITY, f64::min) - 5.0,
            xs.iter().cloned().fold(f64::NEG_INFINITY, f64::max) + 5.0,
            ys.iter().cloned().fold(f64::INFINITY, f64::min) - 5.0,
            ys.iter().cloned().fold(f64::NEG_INFINITY, f64::max) + 10.0,
        );
    }

    /// Returns the 7 control points for the sleeve cap curve.
    fn cap_curve_points(&self) -> Vec<Point2> {
        vec![
            self.pt("I"),
            self.pt("G3"),
            self.pt("G2"),
            self.pt("E"),
            self.pt("H2"),
            self.pt("H3"),
            self.pt("I'"),
        ]
    }

    /// Total length of sleeve cap path as straight segments.
    pub fn sleeve_cap_control(&self) -> f64 {
        let pts = self.cap_curve_points();
        let mut total = 0.0;
        for i in 0..pts.len() - 1 {
            total += math::norm(math::sub(pts[i + 1], pts[i]));
        }
        total
    }

    fn draw_line(&self, r: &mut SVGRenderer, k1: &str, k2: &str, style: &str, color: &str, width: f64) {
        let p1 = self.base.points.get(k1).or_else(|| self.base.helper_points.get(k1));
        let p2 = self.base.points.get(k2).or_else(|| self.base.helper_points.get(k2));
        if let (Some(&p1), Some(&p2)) = (p1, p2) {
            r.line(p1[0], p1[1], p2[0], p2[1], color, style, width);
        }
    }

    fn draw_spline(&self, r: &mut SVGRenderer, curve_pts: &[Point2], style: &str, color: &str, width: f64) {
        let beziers = math::cubic_spline_to_beziers(curve_pts);
        for (p0, p1, p2, p3) in beziers {
            r.bezier(p0, p1, p2, p3, color, style, width);
        }
    }

    fn plot_reference(&self, r: &mut SVGRenderer) {
        // Bounding box
        self.draw_line(r, "A", "B", "--", "gray", 1.0);
        self.draw_line(r, "B", "D", "--", "gray", 1.0);
        self.draw_line(r, "D", "C", "--", "gray", 1.0);
        self.draw_line(r, "C", "A", "--", "gray", 1.0);

        // Center and reference lines
        self.draw_line(r, "E", "F", "--", "gray", 1.0);
        self.draw_line(r, "I", "I'", "--", "gray", 1.0);
        self.draw_line(r, "J", "J'", "--", "gray", 1.0);
        self.draw_line(r, "G", "G1", ":", "gray", 0.5);
        self.draw_line(r, "H", "H1", ":", "gray", 0.5);

        // Sleeve outline
        self.draw_line(r, "I", "F1", "-", "blue", 1.0);
        self.draw_line(r, "I'", "F2", "-", "blue", 1.0);
        self.draw_line(r, "F1", "F2", "-", "blue", 1.0);

        // Cap curve
        let curve_pts = self.cap_curve_points();
        self.draw_spline(r, &curve_pts, "-", "blue", 1.0);

        // Point labels
        for (name, &coord) in &self.base.points {
            r.circle(coord[0], coord[1], 0.1, "black");
            r.text(
                coord[0] + 0.5, coord[1],
                &format!("{}\n({:.1}, {:.1})", name, coord[0], coord[1]),
                8.0, "black", "left", "normal",
            );
        }

        for (name, &coord) in &self.base.helper_points {
            r.circle(coord[0], coord[1], 0.07, "gray");
            r.text(coord[0] + 0.5, coord[1], name, 8.0, "gray", "left", "normal");
        }

        // Scale bar
        let c = self.pt("C");
        let d = self.pt("D");
        let min_y = c[1].max(d[1]);
        r.line(0.0, min_y + 3.0, 10.0, min_y + 3.0, "black", "-", 4.0);
        r.text(5.0, min_y + 5.0, "10 cm Scale", 8.0, "black", "center", "normal");

        let e = self.pt("E");
        r.text(
            e[0], min_y + 8.0,
            &format!("Sleeve Cap Control: {:.2} cm", self.sleeve_cap_control()),
            9.0, "blue", "center", "normal",
        );
    }

    fn plot_printable(&self, r: &mut SVGRenderer) {
        self.draw_line(r, "I", "F1", "-", "blue", 1.0);
        self.draw_line(r, "I'", "F2", "-", "blue", 1.0);
        self.draw_line(r, "F1", "F2", "-", "blue", 1.0);

        let curve_pts = self.cap_curve_points();
        self.draw_spline(r, &curve_pts, "-", "blue", 1.0);

        let c = self.pt("C");
        let d = self.pt("D");
        let min_y = c[1].max(d[1]);
        r.line(0.0, min_y + 3.0, 10.0, min_y + 3.0, "black", "-", 4.0);
        r.text(5.0, min_y + 5.0, "10 cm Scale", 8.0, "black", "center", "normal");
    }

    /// Render pattern as SVG string.
    ///
    /// * `variant` — `"construction"` for reference sheet, `"pattern"` for clean 1:1.
    pub fn render_svg(&self, variant: &str) -> String {
        let mut r = SVGRenderer::new(self.bounds, false);

        if variant == "construction" {
            self.plot_reference(&mut r);
        } else {
            self.plot_printable(&mut r);
        }

        r.to_svg()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::measurements::default_measurements;

    #[test]
    fn test_sleeve_construction_t38() {
        let fm = default_measurements(38);
        let sm = SleeveMeasurements::from_full(&fm);
        let pat = SleevePattern::new(sm, SleeveControlParameters::default());
        assert!(pat.sleeve_cap_control() > 0.0);
    }

    #[test]
    fn test_sleeve_render_svg() {
        let fm = default_measurements(38);
        let sm = SleeveMeasurements::from_full(&fm);
        let pat = SleevePattern::new(sm, SleeveControlParameters::default());
        let svg = pat.render_svg("construction");
        assert!(svg.contains("<svg"));
        assert!(svg.contains("</svg>"));
        assert!(svg.contains("Sleeve Cap Control"));
    }

    #[test]
    fn test_sleeve_render_pattern_variant() {
        let fm = default_measurements(38);
        let sm = SleeveMeasurements::from_full(&fm);
        let pat = SleevePattern::new(sm, SleeveControlParameters::default());
        let svg = pat.render_svg("pattern");
        assert!(svg.contains("<svg"));
        assert!(svg.contains("10 cm Scale"));
    }

    #[test]
    fn test_sleeve_stretch() {
        let fm = default_measurements(38);
        let sm = SleeveMeasurements::from_full(&fm);
        let mut pat = SleevePattern::new(sm, SleeveControlParameters::default());
        assert!(pat.stretch(0.3, 0.1, 0.5).is_ok());
        assert!(pat.stretch(0.1, 0.1, 1.0).is_err());
    }
}
