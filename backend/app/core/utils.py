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
