/// Corset / bodice block pattern drafting.
///
/// Constructs front and back bodice pieces from body measurements using
/// French pattern drafting methods with Bezier curve interpolation.

use crate::math::{self, Point2};
use crate::measurements::FullMeasurements;
use crate::patterns::stretch::StretchBase;
use crate::renderers::svg::SVGRenderer;

/// Subset of measurements specifically required for the corset draft.
#[derive(Debug, Clone)]
pub struct CorsetMeasurements {
    pub back_waist_length: f64,
    pub front_waist_length: f64,
    pub full_bust: f64,
    pub bust_height: f64,
    pub full_waist: f64,
    pub full_hip: f64,
    pub half_back_width: f64,
    pub half_front_width: f64,
    pub shoulder_length: f64,
    pub underarm_height: f64,
    pub waist_to_hip: f64,
    pub neck_width: f64,
    pub neck_back_height: f64,
}

impl CorsetMeasurements {
    /// Derive corset measurements from full body measurements.
    ///
    /// Computes `neck_width` numerically from `neck_circumference`
    /// using quarter-ellipse arc approximation.
    pub fn from_full(fm: &FullMeasurements) -> Self {
        let neck_back_height = 2.0;
        let neck_front_height = fm.back_waist_length - fm.front_waist_length + neck_back_height;
        let nc = fm.neck_circumference;

        // Solve: sqrt((a^2 + neck_back_height^2) / 2) + sqrt((a^2 + neck_front_height^2) / 2) = nc / pi
        let f = |a: f64| {
            ((a * a + neck_back_height * neck_back_height) / 2.0).sqrt()
                + ((a * a + neck_front_height * neck_front_height) / 2.0).sqrt()
                - nc / std::f64::consts::PI
        };

        let neck_width = math::dichotomic_search(f, 0.01, nc / std::f64::consts::PI, 1e-6);

        CorsetMeasurements {
            back_waist_length: fm.back_waist_length,
            front_waist_length: fm.front_waist_length,
            full_bust: fm.full_bust,
            bust_height: fm.bust_height,
            full_waist: fm.full_waist,
            full_hip: fm.full_hip,
            half_back_width: fm.half_back_width,
            half_front_width: fm.half_front_width,
            shoulder_length: fm.shoulder_length,
            underarm_height: fm.underarm_height,
            waist_to_hip: fm.waist_to_hip,
            neck_width,
            neck_back_height,
        }
    }
}

/// Control parameters for Bezier curves in the pattern.
#[derive(Debug, Clone)]
pub struct CorsetControlParameters {
    pub front_neck_center: f64,
    pub back_neck_center: f64,
    pub front_neck_top: f64,
    pub back_neck_top: f64,
    pub armhole_curve: f64,
}

impl Default for CorsetControlParameters {
    fn default() -> Self {
        Self {
            front_neck_center: 0.8,
            back_neck_center: 0.5,
            front_neck_top: 0.34,
            back_neck_top: 0.20,
            armhole_curve: 0.4,
        }
    }
}

/// Corset / bodice block pattern with front and back pieces.
pub struct CorsetPattern {
    pub base: StretchBase,
    pub m: CorsetMeasurements,
    pub b: CorsetControlParameters,
    pub pattern_gap: f64,
    pub bounds: (f64, f64, f64, f64),
}

impl CorsetPattern {
    pub fn new(measurements: CorsetMeasurements, control: CorsetControlParameters) -> Self {
        let mut pat = CorsetPattern {
            base: StretchBase::new(),
            m: measurements,
            b: control,
            pattern_gap: 5.0,
            bounds: (0.0, 0.0, 0.0, 0.0),
        };
        pat.build_construction_points();
        pat.build_bezier_helper_points();
        pat
    }

    /// Apply stretch to all points.
    pub fn stretch(&mut self, horizontal: f64, vertical: f64, usage: f64) -> Result<(), String> {
        self.base.stretch(horizontal, vertical, usage)
    }

    fn pt(&self, name: &str) -> Point2 {
        self.base.points[name]
    }

    fn hp(&self, name: &str) -> Point2 {
        self.base.helper_points[name]
    }

    fn build_construction_points(&mut self) {
        let pts = &mut self.base.points;

        // B: Waist level (reference origin)
        pts.insert("B".into(), [0.0, 0.0]);
        let width = self.m.full_waist / 4.0;
        pts.insert("B1".into(), [-width, 0.0]);

        // E: Front top
        pts.insert("E".into(), [0.0, self.m.front_waist_length]);
        // F: Back top
        pts.insert(
            "F".into(),
            [0.0, self.m.back_waist_length + self.m.neck_back_height / 2.0],
        );

        // G and H: neck construction
        let e = pts["E"];
        let f = pts["F"];
        let g = math::sub(e, [self.m.neck_width, 0.0]);
        pts.insert(
            "H".into(),
            math::add(f, [-self.m.neck_width, self.m.neck_back_height / 2.0]),
        );

        // A: Hip level
        pts.insert("A".into(), [0.0, -self.m.waist_to_hip]);
        let hip_width = self.m.full_hip / 4.0;
        pts.insert("A1".into(), [-hip_width, -self.m.waist_to_hip]);

        // C: Bust level
        let c_y = e[1] - self.m.bust_height;
        pts.insert("C".into(), [0.0, c_y]);

        // C1: defined by full_hip and underarm_height
        let b1 = pts["B1"];
        let x = -hip_width;
        let dx = x - b1[0];
        let dy = (self.m.underarm_height * self.m.underarm_height - dx * dx).sqrt();
        let y = b1[1] + dy;
        pts.insert("C1".into(), [x, y]);

        // D: Shoulder level, midpoint of F and C
        let d = math::scale(0.5, math::add(f, [0.0, c_y]));
        pts.insert("D".into(), d);
        pts.insert("D1".into(), math::sub(d, [self.m.half_front_width, 0.0]));
        pts.insert("D2".into(), math::sub(d, [self.m.half_back_width, 0.0]));

        // J: 1/3 of the way from G to H
        let h = pts["H"];
        let j = math::add(math::scale(2.0 / 3.0, g), math::scale(1.0 / 3.0, h));
        let k_width =
            (self.m.shoulder_length * self.m.shoulder_length - (h[1] - j[1]).powi(2)).sqrt();
        pts.insert("K".into(), math::sub(j, [k_width, 0.0]));
    }

    fn build_bezier_helper_points(&mut self) {
        let front_neck_center_strength = self.b.front_neck_center * self.m.neck_width;
        let back_neck_center_strength = self.b.back_neck_center * self.m.neck_width;
        let front_neck_top_strength = self.b.front_neck_top * self.m.neck_width;
        let back_neck_top_strength = self.b.back_neck_top * self.m.neck_width;
        let armhole_curve_offset = self.b.armhole_curve * self.m.underarm_height;

        let e = self.pt("E");
        let f = self.pt("F");
        let h = self.pt("H");
        let k = self.pt("K");
        let c1 = self.pt("C1");
        let b1 = self.pt("B1");

        // Neck helpers
        self.base
            .helper_points
            .insert("E1".into(), math::sub(e, [front_neck_center_strength, 0.0]));
        self.base
            .helper_points
            .insert("F1".into(), math::add(f, [-back_neck_center_strength, 0.0]));

        // H1: perpendicular to H-K at H, toward E
        let vec_hk = math::sub(k, h);
        let perp_hk_raw = math::perp(vec_hk);
        let perp_hk_norm = math::normalize(perp_hk_raw);
        let perp_hk = if math::dot(perp_hk_norm, math::sub(e, h)) < 0.0 {
            math::scale(-1.0, perp_hk_norm)
        } else {
            perp_hk_norm
        };
        self.base.helper_points.insert(
            "H1".into(),
            math::add(h, math::scale(front_neck_top_strength, perp_hk)),
        );

        // H2: perpendicular to H-K at H, toward F
        let perp_hk_back_norm = math::normalize(math::perp(vec_hk));
        let perp_hk_back = if math::dot(perp_hk_back_norm, math::sub(f, h)) < 0.0 {
            math::scale(-1.0, perp_hk_back_norm)
        } else {
            perp_hk_back_norm
        };
        self.base.helper_points.insert(
            "H2".into(),
            math::add(h, math::scale(back_neck_top_strength, perp_hk_back)),
        );

        // Armhole helpers
        let vec_kh = math::sub(h, k);
        let perp_kh_raw = math::normalize(math::perp(vec_kh));

        let vec_b1c1 = math::sub(c1, b1);
        let perp_b1c1_raw = math::normalize(math::perp(vec_b1c1));

        for x_str in &["1", "2"] {
            let dx_key = format!("D{}", x_str);
            let dx = self.pt(&dx_key);

            let mut perp_dir = perp_b1c1_raw;
            if math::dot(perp_dir, math::sub(dx, c1)) < 0.0 {
                perp_dir = math::scale(-1.0, perp_dir);
            }
            let cx1 = math::add(c1, math::scale(armhole_curve_offset, perp_dir));
            self.base
                .helper_points
                .insert(format!("C1{}", x_str), cx1);

            // Perpendicular direction for K side
            let perp_kh = if math::dot(perp_kh_raw, math::sub(dx, k)) < 0.0 {
                math::scale(-1.0, perp_kh_raw)
            } else {
                perp_kh_raw
            };

            // Solve for t such that Bezier passes through DX
            let residual = |t: f64| {
                let one_m_t = 1.0 - t;
                // R = DX - (1-t)^2*(1+2t)*K - 3*(1-t)*t^2*CX1 - t^3*C1
                let term_k = math::scale(one_m_t * one_m_t * (1.0 + 2.0 * t), k);
                let term_cx1 = math::scale(3.0 * one_m_t * t * t, cx1);
                let term_c1 = math::scale(t * t * t, c1);
                let r = math::sub(dx, math::add(term_k, math::add(term_cx1, term_c1)));
                r[0] * perp_kh[1] - r[1] * perp_kh[0]
            };

            let t = math::dichotomic_search(residual, 0.01, 0.99, 1e-6);

            let one_m_t = 1.0 - t;
            let term_k = math::scale(one_m_t * one_m_t * (1.0 + 2.0 * t), k);
            let term_cx1 = math::scale(3.0 * one_m_t * t * t, cx1);
            let term_c1 = math::scale(t * t * t, c1);
            let r = math::sub(dx, math::add(term_k, math::add(term_cx1, term_c1)));
            let coeff = 3.0 * one_m_t * one_m_t * t;
            let lambda_val = math::dot(r, perp_kh) / coeff;
            let kx = math::add(k, math::scale(lambda_val, perp_kh));
            self.base
                .helper_points
                .insert(format!("K{}", x_str), kx);
        }
    }

    fn mirror_point(&self, p: Point2) -> Point2 {
        [-p[0] + self.pattern_gap, p[1]]
    }

    fn draw_line(&self, r: &mut SVGRenderer, k1: &str, k2: &str, style: &str, color: &str) {
        if let (Some(&p1), Some(&p2)) = (self.base.points.get(k1), self.base.points.get(k2)) {
            r.line(p1[0], p1[1], p2[0], p2[1], color, style, 1.0);
        }
    }

    fn draw_bezier(&self, r: &mut SVGRenderer, p0: Point2, p1: Point2, p2: Point2, p3: Point2, style: &str, color: &str) {
        r.bezier(p0, p1, p2, p3, color, style, 1.0);
    }

    fn plot_front_curves(&self, r: &mut SVGRenderer) {
        let a1 = self.pt("A1");
        let b1 = self.pt("B1");
        let c1 = self.pt("C1");
        let e = self.pt("E");
        let b = self.pt("B");
        let a = self.pt("A");
        let h = self.pt("H");
        let k = self.pt("K");

        // Side curve: A1 → B1
        let control_dist_a1 = math::norm(math::sub(b1, a1)) / 3.0;
        let p1_a1b1 = math::add(a1, [0.0, control_dist_a1]);
        let vec_be = math::sub(e, b);
        let unit_be = math::normalize(vec_be);
        let control_dist_b1 = math::norm(math::sub(b1, a1)) / 3.0;
        let p2_a1b1 = math::sub(b1, math::scale(control_dist_b1, unit_be));
        self.draw_bezier(r, a1, p1_a1b1, p2_a1b1, b1, "-", "blue");

        // B1 → C1
        let p1_b1c1 = math::add(b1, math::scale(control_dist_b1, unit_be));
        let vec_b1c1 = math::sub(c1, b1);
        let dist_b1c1 = math::norm(vec_b1c1);
        let unit_b1c1 = math::normalize(vec_b1c1);
        let p2_b1c1 = math::sub(c1, math::scale(dist_b1c1 * 0.3, unit_b1c1));
        self.draw_bezier(r, b1, p1_b1c1, p2_b1c1, c1, "-", "blue");

        // Center line: A → E
        r.line(a[0], a[1], e[0], e[1], "blue", "-", 1.0);
        // Bottom edge: A → A1
        r.line(a[0], a[1], a1[0], a1[1], "blue", "-", 1.0);

        // Neck: H → E
        let h1 = self.hp("H1");
        let e1 = self.hp("E1");
        self.draw_bezier(r, h, h1, e1, e, "-", "blue");

        // Shoulder: H → K
        r.line(h[0], h[1], k[0], k[1], "blue", "-", 1.0);

        // Armhole: K → C1 through D1
        let k1_hp = self.hp("K1");
        let c11 = self.hp("C11");
        self.draw_bezier(r, k, k1_hp, c11, c1, "-", "blue");
    }

    fn plot_back_curves(&self, r: &mut SVGRenderer) {
        let a1 = self.pt("A1");
        let b1 = self.pt("B1");
        let c1 = self.pt("C1");
        let e = self.pt("E");
        let b = self.pt("B");
        let a = self.pt("A");
        let f = self.pt("F");
        let h = self.pt("H");
        let k = self.pt("K");

        let m_a1 = self.mirror_point(a1);
        let m_b1 = self.mirror_point(b1);
        let m_c1 = self.mirror_point(c1);
        let m_a = self.mirror_point(a);
        let m_f = self.mirror_point(f);
        let m_e = self.mirror_point(e);
        let m_b = self.mirror_point(b);

        // Side curve: m_A1 → m_B1
        let m_control_dist_a1 = math::norm(math::sub(m_b1, m_a1)) / 3.0;
        let m_p1_a1b1 = math::add(m_a1, [0.0, m_control_dist_a1]);
        let m_vec_be = math::sub(m_e, m_b);
        let m_unit_be = math::normalize(m_vec_be);
        let m_control_dist_b1 = math::norm(math::sub(m_b1, m_a1)) / 3.0;
        let m_p2_a1b1 = math::sub(m_b1, math::scale(m_control_dist_b1, m_unit_be));
        self.draw_bezier(r, m_a1, m_p1_a1b1, m_p2_a1b1, m_b1, "-", "green");

        // m_B1 → m_C1
        let m_p1_b1c1 = math::add(m_b1, math::scale(m_control_dist_b1, m_unit_be));
        let m_vec_b1c1 = math::sub(m_c1, m_b1);
        let m_dist_b1c1 = math::norm(m_vec_b1c1);
        let m_unit_b1c1 = math::normalize(m_vec_b1c1);
        let m_p2_b1c1 = math::sub(m_c1, math::scale(m_dist_b1c1 * 0.3, m_unit_b1c1));
        self.draw_bezier(r, m_b1, m_p1_b1c1, m_p2_b1c1, m_c1, "-", "green");

        // Center line: m_A → m_F
        r.line(m_a[0], m_a[1], m_f[0], m_f[1], "green", "-", 1.0);
        // Bottom edge: m_A → m_A1
        r.line(m_a[0], m_a[1], m_a1[0], m_a1[1], "green", "-", 1.0);

        // Neck: m_H → m_F
        let m_h = self.mirror_point(h);
        let m_h2 = self.mirror_point(self.hp("H2"));
        let m_f1 = self.mirror_point(self.hp("F1"));
        self.draw_bezier(r, m_h, m_h2, m_f1, m_f, "-", "green");

        // Shoulder: m_H → m_K
        let m_k = self.mirror_point(k);
        r.line(m_h[0], m_h[1], m_k[0], m_k[1], "green", "-", 1.0);

        // Armhole: m_K → m_C1
        let m_k2 = self.mirror_point(self.hp("K2"));
        let m_c12 = self.mirror_point(self.hp("C12"));
        self.draw_bezier(r, m_k, m_k2, m_c12, m_c1, "-", "green");
    }

    fn plot_reference(&self, r: &mut SVGRenderer) {
        self.draw_line(r, "A", "E", "--", "gray");
        self.draw_line(r, "A", "A1", "--", "gray");

        self.plot_front_curves(r);
        self.plot_back_curves(r);

        let b = self.pt("B");

        // Front point labels
        for (name, &coord) in &self.base.points {
            if name == "D2" {
                continue;
            }
            r.circle(coord[0], coord[1], 0.1, "blue");
            let display_x = (coord[0] - b[0]).abs();
            let display_y = coord[1] - b[1];
            r.text(
                coord[0] + 0.5, coord[1],
                &format!("{}\n({:.1}, {:.1})", name, display_x, display_y),
                8.0, "blue", "left", "normal",
            );
        }

        // Back point labels
        let m_b = self.mirror_point(b);
        for name in &["A", "A1", "B", "B1", "C1", "D2", "F", "H", "K"] {
            if let Some(&coord) = self.base.points.get(*name) {
                let m_coord = self.mirror_point(coord);
                r.circle(m_coord[0], m_coord[1], 0.1, "green");
                let display_x = (m_coord[0] - m_b[0]).abs();
                let display_y = m_coord[1] - m_b[1];
                r.text(
                    m_coord[0] + 0.5, m_coord[1],
                    &format!("{}\n({:.1}, {:.1})", name, display_x, display_y),
                    8.0, "green", "left", "normal",
                );
            }
        }

        // Front helper labels
        for name in &["H1", "E1", "C11", "K1"] {
            if let Some(&coord) = self.base.helper_points.get(*name) {
                r.circle(coord[0], coord[1], 0.07, "gray");
                r.text(coord[0] + 0.5, coord[1], name, 8.0, "gray", "left", "normal");
            }
        }

        // Back helper labels
        for name in &["H2", "F1", "C12", "K2"] {
            if let Some(&coord) = self.base.helper_points.get(*name) {
                let m_coord = self.mirror_point(coord);
                r.circle(m_coord[0], m_coord[1], 0.07, "gray");
                r.text(m_coord[0] + 0.5, m_coord[1], name, 8.0, "gray", "left", "normal");
            }
        }

        // Scale bar
        let a = self.pt("A");
        let a1 = self.pt("A1");
        let scale_y = a[1].min(a1[1]) - 5.0;
        r.line(0.0, scale_y, 10.0, scale_y, "black", "-", 4.0);
        r.text(5.0, scale_y - 2.0, "10 cm Scale", 8.0, "black", "center", "normal");

        // Labels
        let m_a = self.mirror_point(a);
        let front_center_x = (a[0] + a1[0]) / 2.0;
        let m_a1 = self.mirror_point(a1);
        let back_center_x = (m_a[0] + m_a1[0]) / 2.0;
        let label_y = b[1];
        r.text(front_center_x, label_y, "FRONT", 12.0, "blue", "center", "bold");
        r.text(back_center_x, label_y, "BACK", 12.0, "green", "center", "bold");
    }

    fn plot_printable(&self, r: &mut SVGRenderer) {
        self.plot_front_curves(r);
        self.plot_back_curves(r);

        let a = self.pt("A");
        let a1 = self.pt("A1");
        let b = self.pt("B");

        // Scale bar
        let scale_y = a[1].min(a1[1]) - 5.0;
        r.line(0.0, scale_y, 10.0, scale_y, "black", "-", 4.0);
        r.text(5.0, scale_y - 2.0, "10 cm Scale", 8.0, "black", "center", "normal");

        // Labels
        let m_a = self.mirror_point(a);
        let front_center_x = (a[0] + a1[0]) / 2.0;
        let m_a1 = self.mirror_point(a1);
        let back_center_x = (m_a[0] + m_a1[0]) / 2.0;
        let label_y = b[1];
        r.text(front_center_x, label_y, "FRONT", 12.0, "blue", "center", "bold");
        r.text(back_center_x, label_y, "BACK", 12.0, "green", "center", "bold");
    }

    fn prepare_bounds(&mut self) {
        self.pattern_gap = 5.0;
        let xs: Vec<f64> = self.base.points.values().map(|p| p[0]).collect();
        let ys: Vec<f64> = self.base.points.values().map(|p| p[1]).collect();
        let min_x = xs.iter().cloned().fold(f64::INFINITY, f64::min) - 5.0;
        let max_x = -xs.iter().cloned().fold(f64::INFINITY, f64::min) + self.pattern_gap + 5.0;
        let min_y = ys.iter().cloned().fold(f64::INFINITY, f64::min) - 10.0;
        let max_y = ys.iter().cloned().fold(f64::NEG_INFINITY, f64::max) + 5.0;
        self.bounds = (min_x, max_x, min_y, max_y);
    }

    /// Render pattern as SVG string.
    ///
    /// * `variant` — `"construction"` for reference sheet, `"pattern"` for clean 1:1.
    pub fn render_svg(&mut self, variant: &str) -> String {
        self.prepare_bounds();

        let mut r = SVGRenderer::new(self.bounds, true);

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
    fn test_corset_construction_t38() {
        let fm = default_measurements(38);
        let cm = CorsetMeasurements::from_full(&fm);
        assert!(cm.neck_width > 0.0);
        assert!((cm.neck_back_height - 2.0).abs() < 1e-10);
    }

    #[test]
    fn test_corset_render_svg() {
        let fm = default_measurements(38);
        let cm = CorsetMeasurements::from_full(&fm);
        let mut pat = CorsetPattern::new(cm, CorsetControlParameters::default());
        let svg = pat.render_svg("construction");
        assert!(svg.contains("<svg"));
        assert!(svg.contains("</svg>"));
        assert!(svg.contains("FRONT"));
        assert!(svg.contains("BACK"));
    }

    #[test]
    fn test_corset_render_pattern_variant() {
        let fm = default_measurements(40);
        let cm = CorsetMeasurements::from_full(&fm);
        let mut pat = CorsetPattern::new(cm, CorsetControlParameters::default());
        let svg = pat.render_svg("pattern");
        assert!(svg.contains("<svg"));
        assert!(svg.contains("FRONT"));
    }

    #[test]
    fn test_corset_stretch() {
        let fm = default_measurements(38);
        let cm = CorsetMeasurements::from_full(&fm);
        let mut pat = CorsetPattern::new(cm, CorsetControlParameters::default());
        assert!(pat.stretch(0.3, 0.1, 0.5).is_ok());
        // Stretching again should fail
        assert!(pat.stretch(0.1, 0.1, 1.0).is_err());
    }
}
