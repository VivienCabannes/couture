/// Lightweight SVG renderer for sewing patterns.
///
/// Coordinates are in cm; the SVG uses mm units for correct physical sizing when printed.

const CM_TO_MM: f64 = 10.0;

fn mm(v: f64) -> f64 {
    v * CM_TO_MM
}

fn fmt(v: f64) -> String {
    format!("{:.2}", v)
}

/// Stroke dash patterns for line styles.
fn stroke_dasharray(style: &str) -> Option<&'static str> {
    match style {
        "--" => Some("5,3"),
        ":" => Some("2,2"),
        "-." => Some("5,2,2,2"),
        _ => None, // solid "-"
    }
}

/// Accumulates drawing primitives and emits a complete SVG document.
pub struct SVGRenderer {
    min_x: f64,
    max_x: f64,
    min_y: f64,
    max_y: f64,
    y_flip: bool,
    elements: Vec<String>,
}

impl SVGRenderer {
    /// Create a new renderer.
    ///
    /// * `bounds` — `(min_x, max_x, min_y, max_y)` in cm.
    /// * `y_flip` — if true, flip the y-axis (mathematical coords, y up).
    pub fn new(bounds: (f64, f64, f64, f64), y_flip: bool) -> Self {
        Self {
            min_x: bounds.0,
            max_x: bounds.1,
            min_y: bounds.2,
            max_y: bounds.3,
            y_flip,
            elements: Vec::new(),
        }
    }

    // -- coordinate helpers --

    fn tx(&self, x: f64) -> f64 {
        mm(x - self.min_x)
    }

    fn ty(&self, y: f64) -> f64 {
        if self.y_flip {
            mm(self.max_y - y)
        } else {
            mm(y - self.min_y)
        }
    }

    fn pt(&self, x: f64, y: f64) -> (f64, f64) {
        (self.tx(x), self.ty(y))
    }

    // -- drawing primitives --

    /// Draw a line from `(x1, y1)` to `(x2, y2)`.
    pub fn line(&mut self, x1: f64, y1: f64, x2: f64, y2: f64, color: &str, style: &str, width: f64) {
        let (sx1, sy1) = self.pt(x1, y1);
        let (sx2, sy2) = self.pt(x2, y2);
        let dash = stroke_dasharray(style);
        let dash_attr = match dash {
            Some(d) => format!(" stroke-dasharray=\"{}\"", d),
            None => String::new(),
        };
        self.elements.push(format!(
            "<line x1=\"{}\" y1=\"{}\" x2=\"{}\" y2=\"{}\" stroke=\"{}\" stroke-width=\"{}\" fill=\"none\"{dash_attr}/>",
            fmt(sx1), fmt(sy1), fmt(sx2), fmt(sy2), color, fmt(mm(width * 0.03))
        ));
    }

    /// Draw a polyline through a sequence of `(x, y)` points.
    pub fn polyline(&mut self, points: &[[f64; 2]], color: &str, style: &str, width: f64) {
        let pts_str: String = points
            .iter()
            .map(|p| format!("{},{}", fmt(self.tx(p[0])), fmt(self.ty(p[1]))))
            .collect::<Vec<_>>()
            .join(" ");
        let dash = stroke_dasharray(style);
        let dash_attr = match dash {
            Some(d) => format!(" stroke-dasharray=\"{}\"", d),
            None => String::new(),
        };
        self.elements.push(format!(
            "<polyline points=\"{}\" stroke=\"{}\" stroke-width=\"{}\" fill=\"none\"{dash_attr}/>",
            pts_str, color, fmt(mm(width * 0.03))
        ));
    }

    /// Draw a cubic Bezier curve as a native SVG path.
    pub fn bezier(&mut self, p0: [f64; 2], p1: [f64; 2], p2: [f64; 2], p3: [f64; 2], color: &str, style: &str, width: f64) {
        let (sx0, sy0) = self.pt(p0[0], p0[1]);
        let (sx1, sy1) = self.pt(p1[0], p1[1]);
        let (sx2, sy2) = self.pt(p2[0], p2[1]);
        let (sx3, sy3) = self.pt(p3[0], p3[1]);
        let dash = stroke_dasharray(style);
        let dash_attr = match dash {
            Some(d) => format!(" stroke-dasharray=\"{}\"", d),
            None => String::new(),
        };
        let d = format!(
            "M {},{} C {},{} {},{} {},{}",
            fmt(sx0), fmt(sy0), fmt(sx1), fmt(sy1), fmt(sx2), fmt(sy2), fmt(sx3), fmt(sy3)
        );
        self.elements.push(format!(
            "<path d=\"{}\" stroke=\"{}\" stroke-width=\"{}\" fill=\"none\"{dash_attr}/>",
            d, color, fmt(mm(width * 0.03))
        ));
    }

    /// Draw a filled circle at `(x, y)` with radius `r`.
    pub fn circle(&mut self, x: f64, y: f64, r: f64, color: &str) {
        let (sx, sy) = self.pt(x, y);
        self.elements.push(format!(
            "<circle cx=\"{}\" cy=\"{}\" r=\"{}\" fill=\"{}\"/>",
            fmt(sx), fmt(sy), fmt(mm(r)), color
        ));
    }

    /// Draw text at `(x, y)`.
    pub fn text(&mut self, x: f64, y: f64, content: &str, size: f64, color: &str, ha: &str, fontweight: &str) {
        let (sx, sy) = self.pt(x, y);
        let anchor = match ha {
            "center" => "middle",
            "right" => "end",
            _ => "start",
        };
        let weight_attr = if fontweight == "bold" {
            " font-weight=\"bold\""
        } else {
            ""
        };
        // Escape XML entities
        let escaped = content
            .replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;");
        let lines: Vec<&str> = escaped.split('\n').collect();
        if lines.len() == 1 {
            self.elements.push(format!(
                "<text x=\"{}\" y=\"{}\" font-family=\"Arial, sans-serif\" font-size=\"{}\" fill=\"{}\" text-anchor=\"{}\"{}>{}</text>",
                fmt(sx), fmt(sy), fmt(mm(size * 0.035)), color, anchor, weight_attr, escaped
            ));
        } else {
            let mut parts = vec![format!(
                "<text x=\"{}\" y=\"{}\" font-family=\"Arial, sans-serif\" font-size=\"{}\" fill=\"{}\" text-anchor=\"{}\"{}>",
                fmt(sx), fmt(sy), fmt(mm(size * 0.035)), color, anchor, weight_attr
            )];
            for (i, line) in lines.iter().enumerate() {
                let dy = if i == 0 { "0" } else { "1.2em" };
                parts.push(format!("<tspan x=\"{}\" dy=\"{}\">{}</tspan>", fmt(sx), dy, line));
            }
            parts.push("</text>".to_string());
            self.elements.push(parts.join(""));
        }
    }

    // -- output --

    /// Render and return the complete SVG document as a string.
    pub fn to_svg(&self) -> String {
        let width_mm = mm(self.max_x - self.min_x);
        let height_mm = mm(self.max_y - self.min_y);
        let header = format!(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {} {}\">\n",
            fmt(width_mm), fmt(height_mm)
        );
        let body: String = self.elements.iter().map(|el| format!("  {}", el)).collect::<Vec<_>>().join("\n");
        let footer = "\n</svg>\n";
        format!("{}{}{}", header, body, footer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_svg_output() {
        let mut r = SVGRenderer::new((0.0, 10.0, 0.0, 10.0), false);
        r.line(0.0, 0.0, 10.0, 10.0, "black", "-", 1.0);
        let svg = r.to_svg();
        assert!(svg.contains("<svg"));
        assert!(svg.contains("</svg>"));
        assert!(svg.contains("<line"));
    }

    #[test]
    fn test_y_flip() {
        let r = SVGRenderer::new((0.0, 10.0, 0.0, 10.0), true);
        // With y_flip, y=0 should map to max_y * 10mm = 100
        assert!((r.ty(0.0) - 100.0).abs() < 0.01);
        // y=10 should map to 0
        assert!((r.ty(10.0) - 0.0).abs() < 0.01);
    }

    #[test]
    fn test_bezier_output() {
        let mut r = SVGRenderer::new((0.0, 10.0, 0.0, 10.0), false);
        r.bezier([0.0, 0.0], [1.0, 2.0], [3.0, 4.0], [5.0, 5.0], "blue", "-", 1.0);
        let svg = r.to_svg();
        assert!(svg.contains("<path d=\"M"));
        assert!(svg.contains("C "));
    }
}
