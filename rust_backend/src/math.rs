/// 2D point represented as `[x, y]`.
pub type Point2 = [f64; 2];

/// Add two points component-wise.
pub fn add(a: Point2, b: Point2) -> Point2 {
    [a[0] + b[0], a[1] + b[1]]
}

/// Subtract `b` from `a` component-wise.
pub fn sub(a: Point2, b: Point2) -> Point2 {
    [a[0] - b[0], a[1] - b[1]]
}

/// Scale a point by a scalar.
pub fn scale(s: f64, p: Point2) -> Point2 {
    [s * p[0], s * p[1]]
}

/// Euclidean norm (length) of a vector.
pub fn norm(v: Point2) -> f64 {
    (v[0] * v[0] + v[1] * v[1]).sqrt()
}

/// Dot product of two vectors.
pub fn dot(a: Point2, b: Point2) -> f64 {
    a[0] * b[0] + a[1] * b[1]
}

/// Normalize a vector to unit length. Returns `[0, 0]` for zero-length vectors.
pub fn normalize(v: Point2) -> Point2 {
    let n = norm(v);
    if n < 1e-12 {
        [0.0, 0.0]
    } else {
        [v[0] / n, v[1] / n]
    }
}

/// Perpendicular vector (rotate 90 degrees counter-clockwise): `[-y, x]`.
pub fn perp(v: Point2) -> Point2 {
    [-v[1], v[0]]
}

/// Linear interpolation between two points: `a + t * (b - a)`.
pub fn lerp(a: Point2, b: Point2, t: f64) -> Point2 {
    [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
}

/// Find root of `f` in interval `[a, b]` using bisection method.
///
/// The function must have opposite signs at `a` and `b`.
/// Returns approximate root `x` where `f(x) ~ 0`.
pub fn dichotomic_search<F: Fn(f64) -> f64>(f: F, a: f64, b: f64, tol: f64) -> f64 {
    let mut lo = a;
    let mut hi = b;
    while hi - lo > tol {
        let mid = (lo + hi) / 2.0;
        if f(mid) * f(lo) < 0.0 {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    (lo + hi) / 2.0
}

/// A cubic Bezier segment defined by four control points.
pub type BezierSegment = (Point2, Point2, Point2, Point2);

/// Convert a sequence of 2D points to cubic Bezier segments via natural cubic spline.
///
/// Uses the Thomas algorithm (tridiagonal solver) with chord-length parameterization.
/// For `N` points, returns `N-1` Bezier segments.
pub fn cubic_spline_to_beziers(points: &[Point2]) -> Vec<BezierSegment> {
    let n = points.len();
    assert!(n >= 2, "Need at least 2 points");

    if n == 2 {
        let p0 = points[0];
        let p3 = points[1];
        let d = sub(p3, p0);
        let p1 = add(p0, scale(1.0 / 3.0, d));
        let p2 = add(p0, scale(2.0 / 3.0, d));
        return vec![(p0, p1, p2, p3)];
    }

    let m = n - 1; // number of segments

    // Chord lengths
    let mut h = vec![0.0f64; m];
    for i in 0..m {
        h[i] = norm(sub(points[i + 1], points[i]));
        if h[i] < 1e-12 {
            h[i] = 1.0; // avoid division by zero for coincident points
        }
    }

    // Build tridiagonal system for interior points (indices 1..n-2)
    let interior = n - 2;
    // S[i] is the second derivative at point i (2D), natural spline: S[0] = S[n-1] = [0,0]
    let mut s_vals: Vec<Point2> = vec![[0.0, 0.0]; n];

    if interior > 0 {
        let mut b_diag = vec![0.0f64; interior];
        let mut c_diag = vec![0.0f64; interior];
        let mut a_diag = vec![0.0f64; interior];
        let mut d_vec: Vec<Point2> = vec![[0.0, 0.0]; interior];

        for i in 0..interior {
            let idx = i + 1;
            if i > 0 {
                a_diag[i] = h[idx - 1];
            }
            b_diag[i] = 2.0 * (h[idx - 1] + h[idx]);
            if i < interior - 1 {
                c_diag[i] = h[idx];
            }
            // d = 6 * ((pts[idx+1] - pts[idx]) / h[idx] - (pts[idx] - pts[idx-1]) / h[idx-1])
            let slope_right = scale(1.0 / h[idx], sub(points[idx + 1], points[idx]));
            let slope_left = scale(1.0 / h[idx - 1], sub(points[idx], points[idx - 1]));
            d_vec[i] = scale(6.0, sub(slope_right, slope_left));
        }

        // Thomas algorithm (forward elimination)
        for i in 1..interior {
            let w = a_diag[i] / b_diag[i - 1];
            b_diag[i] -= w * c_diag[i - 1];
            d_vec[i] = sub(d_vec[i], scale(w, d_vec[i - 1]));
        }

        // Back substitution
        let mut result: Vec<Point2> = vec![[0.0, 0.0]; interior];
        result[interior - 1] = scale(1.0 / b_diag[interior - 1], d_vec[interior - 1]);
        for i in (0..interior - 1).rev() {
            result[i] = scale(
                1.0 / b_diag[i],
                sub(d_vec[i], scale(c_diag[i], result[i + 1])),
            );
        }

        for i in 0..interior {
            s_vals[i + 1] = result[i];
        }
    }

    // Convert each spline segment to Bezier control points
    let mut beziers = Vec::with_capacity(m);
    for i in 0..m {
        let hi = h[i];
        let a_pt = points[i];
        // b = (pts[i+1] - pts[i]) / hi - hi * (2*S[i] + S[i+1]) / 6
        let b_pt = sub(
            scale(1.0 / hi, sub(points[i + 1], points[i])),
            scale(hi / 6.0, add(scale(2.0, s_vals[i]), s_vals[i + 1])),
        );
        let c_pt = scale(0.5, s_vals[i]);
        let d_pt = scale(1.0 / (6.0 * hi), sub(s_vals[i + 1], s_vals[i]));

        let p0 = a_pt;
        let p1 = add(a_pt, scale(hi / 3.0, b_pt));
        let p2 = add(
            add(a_pt, scale(2.0 * hi / 3.0, b_pt)),
            scale(hi * hi / 3.0, c_pt),
        );
        let p3 = add(
            add(add(a_pt, scale(hi, b_pt)), scale(hi * hi, c_pt)),
            scale(hi * hi * hi, d_pt),
        );

        beziers.push((p0, p1, p2, p3));
    }

    beziers
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_sub() {
        let a = [1.0, 2.0];
        let b = [3.0, 4.0];
        assert_eq!(add(a, b), [4.0, 6.0]);
        assert_eq!(sub(a, b), [-2.0, -2.0]);
    }

    #[test]
    fn test_norm_and_normalize() {
        let v = [3.0, 4.0];
        assert!((norm(v) - 5.0).abs() < 1e-10);
        let n = normalize(v);
        assert!((n[0] - 0.6).abs() < 1e-10);
        assert!((n[1] - 0.8).abs() < 1e-10);
    }

    #[test]
    fn test_dichotomic_search() {
        // Find root of x^2 - 4 in [0, 5] => x = 2
        let root = dichotomic_search(|x| x * x - 4.0, 0.0, 5.0, 1e-8);
        assert!((root - 2.0).abs() < 1e-6);
    }

    #[test]
    fn test_cubic_spline_two_points() {
        let pts = [[0.0, 0.0], [3.0, 6.0]];
        let beziers = cubic_spline_to_beziers(&pts);
        assert_eq!(beziers.len(), 1);
        let (p0, _p1, _p2, p3) = beziers[0];
        assert!((p0[0]).abs() < 1e-10);
        assert!((p3[0] - 3.0).abs() < 1e-10);
    }

    #[test]
    fn test_cubic_spline_three_points() {
        let pts = [[0.0, 0.0], [1.0, 1.0], [2.0, 0.0]];
        let beziers = cubic_spline_to_beziers(&pts);
        assert_eq!(beziers.len(), 2);
        // First segment starts at [0,0], second ends at [2,0]
        assert!((beziers[0].0[0]).abs() < 1e-10);
        assert!((beziers[1].3[0] - 2.0).abs() < 1e-10);
        assert!((beziers[1].3[1]).abs() < 1e-10);
    }

    #[test]
    fn test_perp() {
        assert_eq!(perp([1.0, 0.0]), [0.0, 1.0]);
        assert_eq!(perp([0.0, 1.0]), [-1.0, 0.0]);
    }
}
