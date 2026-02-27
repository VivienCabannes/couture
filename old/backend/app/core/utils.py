def dichotomic_search(f, a, b, tol=1e-6):
    """Find root of f in interval [a, b] using bisection method.

    Same signature as scipy.optimize.brentq for compatibility.

    Args:
        f: Function for which to find root (must have opposite signs at a and b)
        a: Lower bound of interval
        b: Upper bound of interval
        tol: Tolerance for convergence (default 1e-6)

    Returns:
        Approximate root x where f(x) ≈ 0
    """
    lo, hi = a, b
    while hi - lo > tol:
        mid = (lo + hi) / 2
        if f(mid) * f(lo) < 0:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2


def cubic_spline_to_beziers(points):
    """Convert a sequence of 2D points to cubic Bezier segments via natural cubic spline.

    Computes natural cubic spline coefficients through the given points (numpy only),
    then converts each polynomial segment to Bezier control points.

    Args:
        points: List/array of 2D points [(x0,y0), (x1,y1), ...], at least 2 points.

    Returns:
        List of (P0, P1, P2, P3) tuples, each a numpy array of shape (2,).
        For N points, returns N-1 Bezier segments.
    """
    import numpy as np

    pts = [np.asarray(p, dtype=float) for p in points]
    n = len(pts)
    if n < 2:
        raise ValueError("Need at least 2 points")
    if n == 2:
        # Degenerate: straight line as a Bezier
        p0, p3 = pts[0], pts[1]
        p1 = p0 + (p3 - p0) / 3
        p2 = p0 + 2 * (p3 - p0) / 3
        return [(p0, p1, p2, p3)]

    # Number of segments
    m = n - 1

    # Parameterize by chord length for better results
    h = np.zeros(m)
    for i in range(m):
        h[i] = np.linalg.norm(pts[i + 1] - pts[i])
        if h[i] < 1e-12:
            h[i] = 1.0  # avoid division by zero for coincident points

    # Solve for second derivatives (S) using natural spline boundary conditions:
    # S[0] = S[n-1] = 0
    # For interior points:
    #   h[i-1]*S[i-1] + 2*(h[i-1]+h[i])*S[i] + h[i]*S[i+1] = 6*((pts[i+1]-pts[i])/h[i] - (pts[i]-pts[i-1])/h[i-1])
    if m == 1:
        # Only 2 points, already handled above
        pass

    # Build tridiagonal system for interior points (indices 1..n-2)
    interior = n - 2
    if interior == 0:
        # n == 2, handled above
        S = [np.zeros(2)] * n
    else:
        # Tridiagonal solve for each coordinate dimension
        S = [np.zeros(2) for _ in range(n)]

        # Build coefficient arrays
        a_diag = np.zeros(interior)  # sub-diagonal
        b_diag = np.zeros(interior)  # main diagonal
        c_diag = np.zeros(interior)  # super-diagonal
        d_vec = [np.zeros(2) for _ in range(interior)]

        for i in range(interior):
            idx = i + 1  # actual point index
            if i > 0:
                a_diag[i] = h[idx - 1]
            b_diag[i] = 2 * (h[idx - 1] + h[idx])
            if i < interior - 1:
                c_diag[i] = h[idx]
            d_vec[i] = 6 * ((pts[idx + 1] - pts[idx]) / h[idx] - (pts[idx] - pts[idx - 1]) / h[idx - 1])

        # Thomas algorithm (tridiagonal solver)
        # Forward sweep
        for i in range(1, interior):
            w = a_diag[i] / b_diag[i - 1]
            b_diag[i] -= w * c_diag[i - 1]
            d_vec[i] = d_vec[i] - w * d_vec[i - 1]

        # Back substitution
        result = [np.zeros(2) for _ in range(interior)]
        result[-1] = d_vec[-1] / b_diag[-1]
        for i in range(interior - 2, -1, -1):
            result[i] = (d_vec[i] - c_diag[i] * result[i + 1]) / b_diag[i]

        for i in range(interior):
            S[i + 1] = result[i]

    # Convert each spline segment to Bezier control points
    # For segment i (from pts[i] to pts[i+1]):
    #   a_i = pts[i], coefficients of the cubic polynomial in terms of (t/h):
    #   P(t) = a + b*t + c*t^2 + d*t^3, t in [0, h[i]]
    #   where:
    #     a = pts[i]
    #     b = (pts[i+1]-pts[i])/h[i] - h[i]*(2*S[i]+S[i+1])/6
    #     c = S[i]/2
    #     d = (S[i+1]-S[i])/(6*h[i])
    #   Bezier control points:
    #     P0 = a
    #     P1 = a + b*h/3
    #     P2 = a + 2*b*h/3 + c*h^2/3
    #     P3 = a + b*h + c*h^2 + d*h^3
    beziers = []
    for i in range(m):
        hi = h[i]
        a = pts[i]
        b = (pts[i + 1] - pts[i]) / hi - hi * (2 * S[i] + S[i + 1]) / 6
        c = S[i] / 2
        d = (S[i + 1] - S[i]) / (6 * hi)

        P0 = a
        P1 = a + b * hi / 3
        P2 = a + 2 * b * hi / 3 + c * hi**2 / 3
        P3 = a + b * hi + c * hi**2 + d * hi**3

        beziers.append((P0, P1, P2, P3))

    return beziers
