#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from dataclasses import dataclass


# -----------------------------
# Parameters (match TikZ macros)
# -----------------------------
@dataclass
class Params:
    # All in cm (like your TikZ), then converted to mm for SVG output.
    TotalLength: float = 50.0
    ArmholeDepth: float = 15.0
    ChestHalfWidth: float = 15.0
    HemHalfWidth: float = 20.0

    NeckWidthStart: float = 5.5
    StrapWidth: float = 3.0

    FrontNeckDrop: float = 12.0
    BackNeckDrop: float = 6.0

    # Layout
    xshift_back_cm: float = 35.0
    margin_cm: float = 2.0

    # Allowances (cm)
    seam_allowance_cm: float = 1.0
    hem_allowance_cm: float = 2.0

    # Rendering toggles
    draw_point_labels: bool = True
    draw_dimensions: bool = True


CM_TO_MM = 10.0


# -----------------------------
# Small SVG helpers
# -----------------------------
def mm(x_cm: float) -> float:
    return x_cm * CM_TO_MM

def svg_header(width_mm: float, height_mm: float) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="{width_mm:.2f}mm" height="{height_mm:.2f}mm"
     viewBox="0 0 {width_mm:.2f} {height_mm:.2f}">
  <defs>
    <style><![CDATA[
      .outline {{ fill: none; stroke: #000; stroke-width: 1.2; }}
      .sa      {{ fill: none; stroke: #666; stroke-width: 1.0; }}
      .dim     {{ fill: none; stroke: #000; stroke-width: 0.8; }}
      .txt     {{ font-family: Arial, sans-serif; font-size: 10px; fill: #000; }}
      .pt      {{ font-family: Arial, sans-serif; font-size: 10px; fill: #000; }}
    ]]></style>
  </defs>
"""

def svg_footer() -> str:
    return "</svg>\n"

def M(p): return f"M {p[0]:.2f},{p[1]:.2f}"
def L(p): return f"L {p[0]:.2f},{p[1]:.2f}"
def C(c1, c2, p): return f"C {c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} {p[0]:.2f},{p[1]:.2f}"


# ---------------------------------------
# Geometry: same named points as your TikZ
# ---------------------------------------
def compute_points(params: Params, origin_cm=(0.0, 0.0), is_front=True):
    ox, oy = origin_cm
    neck_drop = params.FrontNeckDrop if is_front else params.BackNeckDrop

    # TikZ: A at (0,0), B at (0,-TotalLength), C at (0,-NeckDrop), etc.
    A = (ox + 0.0, oy + 0.0)
    B = (ox + 0.0, oy - params.TotalLength)
    Cc = (ox + 0.0, oy - neck_drop)

    D = (ox + params.NeckWidthStart, oy + 0.0)
    E = (ox + params.NeckWidthStart + params.StrapWidth, oy + 0.0)

    F = (ox + params.ChestHalfWidth, oy - params.ArmholeDepth)
    G = (ox + params.HemHalfWidth, oy - params.TotalLength)

    return {"A": A, "B": B, "C": Cc, "D": D, "E": E, "F": F, "G": G}


# ---------------------------------------
# Curves: interpret TikZ to[out=,in=] as cubic Beziers
# ---------------------------------------
def cubic_from_out_in(p0, p1, out_deg, in_deg, tension=0.35):
    """
    Approximate TikZ `to[out=θ, in=φ]` with a cubic Bezier.
    We choose handle length proportional to chord length.
    """
    import math
    x0, y0 = p0
    x1, y1 = p1
    dx = x1 - x0
    dy = y1 - y0
    chord = math.hypot(dx, dy)
    h = chord * tension

    a0 = math.radians(out_deg)
    a1 = math.radians(in_deg)

    # Note: SVG Y grows downward; TikZ grows upward, but your coordinates are already "down" (negative y).
    # Here we keep directions as if standard math, but because points are already in that coordinate system,
    # it still produces the intended shape.
    c1 = (x0 + h * math.cos(a0), y0 + h * math.sin(a0))
    c2 = (x1 + h * math.cos(a1), y1 + h * math.sin(a1))
    return c1, c2


# ---------------------------------------
# Build stitch path + seam allowance path
# ---------------------------------------
def build_paths(params: Params, pts):
    A, B, Cc, D, E, F, G = pts["A"], pts["B"], pts["C"], pts["D"], pts["E"], pts["F"], pts["G"]

    # Stitch lines (exact topology as your TikZ)
    # (C) to[out=0,in=270] (D)
    neck_c1, neck_c2 = cubic_from_out_in(Cc, D, out_deg=0, in_deg=-90, tension=0.45)

    # (E) to[out=-90,in=180] (F)
    arm_c1, arm_c2 = cubic_from_out_in(E, F, out_deg=-90, in_deg=180, tension=0.45)

    # (F) to[out=-90,in=90] (G)
    side_c1, side_c2 = cubic_from_out_in(F, G, out_deg=-90, in_deg=90, tension=0.30)

    stitch_d = " ".join([
        M(Cc),
        C(neck_c1, neck_c2, D),
        L(E),
        C(arm_c1, arm_c2, F),
        C(side_c1, side_c2, G),
        L(B),
        "Z"
    ])

    # Seam allowance: reproduce your manual offsets.
    # In your TikZ back panel you used:
    #   (C)+(0,1)
    #   (D)+(-.707,.707)
    #   (E)+(.707,.707)
    #   (F)+(.707,.707)
    #   (G)+(1,0)
    #   -- (B)
    # We'll do the same here (and keep B unshifted to mimic your code).
    sC = (Cc[0] + 0.0,     Cc[1] + 1.0)
    sD = (D[0] - 0.707,    D[1] + 0.707)
    sE = (E[0] + 0.707,    E[1] + 0.707)
    sF = (F[0] + 0.707,    F[1] + 0.707)
    sG = (G[0] + 1.0,      G[1] + 0.0)
    sB = B

    # Use same out/in logic for SA curves
    s_neck_c1, s_neck_c2 = cubic_from_out_in(sC, sD, out_deg=0, in_deg=-90, tension=0.45)
    s_arm_c1, s_arm_c2   = cubic_from_out_in(sE, sF, out_deg=-90, in_deg=180, tension=0.45)
    s_side_c1, s_side_c2 = cubic_from_out_in(sF, sG, out_deg=-90, in_deg=90, tension=0.30)

    sa_d = " ".join([
        M(sC),
        C(s_neck_c1, s_neck_c2, sD),
        L(sE),
        C(s_arm_c1, s_arm_c2, sF),
        C(s_side_c1, s_side_c2, sG),
        L(sB),
        "Z"
    ])

    return stitch_d, sa_d


# ---------------------------------------
# Optional labels + very simple dimensions
# ---------------------------------------
def svg_point_label(x_mm, y_mm, text):
    return f'<text class="pt" x="{x_mm:.2f}" y="{y_mm:.2f}">{text}</text>\n'

def svg_text(x_mm, y_mm, text, size=10):
    return f'<text class="txt" x="{x_mm:.2f}" y="{y_mm:.2f}" font-size="{size}px">{text}</text>\n'

def svg_line(p1_mm, p2_mm, cls="dim"):
    return f'<line class="{cls}" x1="{p1_mm[0]:.2f}" y1="{p1_mm[1]:.2f}" x2="{p2_mm[0]:.2f}" y2="{p2_mm[1]:.2f}" />\n'


# ---------------------------------------
# Main SVG assembly (front + back groups)
# ---------------------------------------
def generate_svg(params: Params, filename="robe_salopette_18m.svg"):
    # Compute rough canvas size (cm -> mm)
    width_cm = params.margin_cm * 2 + params.HemHalfWidth + params.xshift_back_cm + params.HemHalfWidth + 5.0
    height_cm = params.margin_cm * 2 + params.TotalLength + 6.0
    W, H = mm(width_cm), mm(height_cm)

    out = [svg_header(W, H)]

    # Origins in cm (top-left margin); y grows downward in SVG, so we flip sign on y when mapping.
    # We will map cm coords (x, y) where your TikZ y is negative downwards:
    # SVG y = margin - y_cm
    def map_pt(p_cm):
        x_cm, y_cm = p_cm
        return (mm(params.margin_cm + x_cm), mm(params.margin_cm - y_cm))

    # FRONT at x=0, BACK at x=xshift_back
    panels = [
        ("Front Pattern", True,  0.0),
        ("Back Pattern",  False, params.xshift_back_cm),
    ]

    # Title
    out.append(svg_text(mm(width_cm / 2.0 - 10.0), mm(1.2), "ROBE SALOPETTE 18 MOIS", size=22))

    for label, is_front, xshift in panels:
        pts_cm = compute_points(params, origin_cm=(xshift, 0.0), is_front=is_front)
        stitch_d_cm, sa_d_cm = build_paths(params, pts_cm)

        # Convert path coordinates cm->mm and also apply y flip
        # For simplicity, rebuild the paths in mm by remapping the points and re-running build_paths in mm-space.
        # That requires recomputing points in cm but mapping them before building the path.
        pts_mm = {k: map_pt(v) for k, v in pts_cm.items()}

        stitch_d, sa_d = build_paths_mmspace(params, pts_mm)

        out.append(f'  <path class="sa" d="{sa_d}" />\n')
        out.append(f'  <path class="outline" d="{stitch_d}" />\n')

        # Labels
        out.append(svg_text(map_pt((xshift + params.ChestHalfWidth / 2.0, 3.0))[0],  # x
                            map_pt((0.0, 3.0))[1],                                  # y
                            label, size=14))

        if params.draw_point_labels:
            for k in ["A", "B", "C", "D", "E", "F", "G"]:
                x, y = pts_mm[k]
                out.append(svg_point_label(x + 3, y - 3, k))

        # Very basic dimensions analogous to your TikZ (not pretty, but functional)
        if params.draw_dimensions:
            A, B = pts_mm["A"], pts_mm["B"]
            # TotalLength dimension line on left of A-B
            dx = -mm(1.2)
            out.append(svg_line((A[0] + dx, A[1]), (B[0] + dx, B[1]), cls="dim"))
            out.append(svg_text((A[0] + dx) + 2, (A[1] + B[1]) / 2, f"TotalLength {params.TotalLength} cm"))

    out.append(svg_footer())

    with open(filename, "w", encoding="utf-8") as f:
        f.write("".join(out))

    print(f"Wrote {filename}")


def build_paths_mmspace(params: Params, pts):
    """
    Same as build_paths(), but points are already in mm SVG space (y downward).
    """
    A, B, Cc, D, E, F, G = pts["A"], pts["B"], pts["C"], pts["D"], pts["E"], pts["F"], pts["G"]

    # Because we're now in SVG coordinates (y down), the out/in angles must be mirrored vertically.
    # Easiest: negate angles that involve "up/down" by flipping sign on degrees.
    # We'll reuse the same helper but apply a sign flip for y-direction consistency.
    def cubic(p0, p1, out_deg, in_deg, tension):
        # Mirror vertical direction: angle -> -angle
        return cubic_from_out_in(p0, p1, out_deg=-out_deg, in_deg=-in_deg, tension=tension)

    neck_c1, neck_c2 = cubic(Cc, D, out_deg=0,   in_deg=-90, tension=0.45)
    arm_c1, arm_c2   = cubic(E,  F, out_deg=-90, in_deg=180, tension=0.45)
    side_c1, side_c2 = cubic(F,  G, out_deg=-90, in_deg=90,  tension=0.30)

    stitch_d = " ".join([
        M(Cc),
        C(neck_c1, neck_c2, D),
        L(E),
        C(arm_c1, arm_c2, F),
        C(side_c1, side_c2, G),
        L(B),
        "Z"
    ])

    # Seam allowance offsets expressed in cm in your TikZ; convert them to mm here.
    sC = (Cc[0] + mm(0.0),     Cc[1] - mm(1.0))      # note: +1cm in TikZ y (up) becomes -1cm in SVG y
    sD = (D[0] - mm(0.707),    D[1] - mm(0.707))
    sE = (E[0] + mm(0.707),    E[1] - mm(0.707))
    sF = (F[0] + mm(0.707),    F[1] - mm(0.707))
    sG = (G[0] + mm(1.0),      G[1] + mm(0.0))
    sB = B

    s_neck_c1, s_neck_c2 = cubic(sC, sD, out_deg=0,   in_deg=-90, tension=0.45)
    s_arm_c1, s_arm_c2   = cubic(sE, sF, out_deg=-90, in_deg=180, tension=0.45)
    s_side_c1, s_side_c2 = cubic(sF, sG, out_deg=-90, in_deg=90,  tension=0.30)

    sa_d = " ".join([
        M(sC),
        C(s_neck_c1, s_neck_c2, sD),
        L(sE),
        C(s_arm_c1, s_arm_c2, sF),
        C(s_side_c1, s_side_c2, sG),
        L(sB),
        "Z"
    ])

    return stitch_d, sa_d


if __name__ == "__main__":
    p = Params()
    generate_svg(p)
