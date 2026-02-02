"""
Corset Base Stretch Pattern Drafting

Based on construction outline for front and back bodice using shared XY axes.
Uses FullMeasurements from measurements.py for body measurements.
Call measurements.stretch() for stretch fabrics before pattern calculation.
"""

from dataclasses import dataclass
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

from measurements import FullMeasurements, default_measurements, individual_measurements, Person


@dataclass
class PatternPoints:
    """Stores all calculated pattern points."""
    # Center line points (on XY axis, x=0)
    A: tuple[float, float] = (0, 0)  # Hip level
    B: tuple[float, float] = (0, 0)  # Waist level
    E: tuple[float, float] = (0, 0)  # Front neck point
    C: tuple[float, float] = (0, 0)  # Bust level
    F: tuple[float, float] = (0, 0)  # Back neck point
    D: tuple[float, float] = (0, 0)  # Shoulder height reference

    # Front side points (positive x)
    A1: tuple[float, float] = (0, 0)  # Hip side
    B1: tuple[float, float] = (0, 0)  # Waist side
    C1: tuple[float, float] = (0, 0)  # Bust side
    D1: tuple[float, float] = (0, 0)  # Front shoulder width point

    # Back side points (negative x)
    A1_back: tuple[float, float] = (0, 0)  # Hip side back
    B1_back: tuple[float, float] = (0, 0)  # Waist side back
    C1_back: tuple[float, float] = (0, 0)  # Bust side back
    D2: tuple[float, float] = (0, 0)       # Back shoulder width point

    # Neckline points
    G: tuple[float, float] = (0, 0)   # Front neck width point
    H: tuple[float, float] = (0, 0)   # Front neck depth point
    I: tuple[float, float] = (0, 0)   # Back neck depth point

    # Shoulder points
    J: tuple[float, float] = (0, 0)   # Shoulder slope reference
    K: tuple[float, float] = (0, 0)   # Front shoulder end
    K_back: tuple[float, float] = (0, 0)  # Back shoulder end


def calculate_pattern(measurements: FullMeasurements) -> PatternPoints:
    """
    Calculate all pattern points based on measurements.
    XY axis is the center front/back line (x=0).
    Front extends to positive x, back extends to negative x.
    Y increases upward from hip level.
    """
    m = measurements
    pts = PatternPoints()

    # Calculate quarter/half measurements
    hip_quarter = m.full_hip / 4
    waist_quarter = m.full_waist / 4
    bust_quarter = m.full_bust / 4

    # Center line construction (all at x=0)
    # A = Hip level (origin)
    pts.A = (0, 0)

    # AB = Waist-to-hip length
    pts.B = (0, m.waist_to_hip)

    # BE = Front waist length
    y_E = pts.B[1] + m.front_waist_length
    pts.E = (0, y_E)

    # EC = 1/2 BE + 1 cm (bust level, measured DOWN from E)
    ec_length = m.front_waist_length / 2 + 1.0
    pts.C = (0, y_E - ec_length)

    # BF = Back waist length + 1 cm
    y_F = pts.B[1] + m.back_waist_length + 1.0
    pts.F = (0, y_F)

    # CD = 1/2 CF (shoulder reference height)
    cf_length = abs(y_F - pts.C[1])
    y_D = pts.C[1] + cf_length / 2
    pts.D = (0, y_D)

    # Side points - Front (positive x)
    pts.A1 = (hip_quarter + 0.5, pts.A[1])
    pts.B1 = (waist_quarter + 4.0, pts.B[1])  # +4cm for dart allowance
    pts.C1 = (bust_quarter, pts.C[1])
    pts.D1 = (m.half_front_width / 2 + 0.3, pts.D[1])

    # Side points - Back (negative x, mirrored)
    pts.A1_back = (-(hip_quarter + 0.5), pts.A[1])
    pts.B1_back = (-(waist_quarter + 4.0), pts.B[1])
    pts.C1_back = (-bust_quarter, pts.C[1])
    pts.D2 = (-m.half_back_width / 2, pts.D[1])

    # Neckline calculations
    half_neck = m.neck_circumference / 2
    eg_length = (half_neck / 3) + (half_neck / 3 / 5)  # 1/3 + 1/5 of 1/3
    gh_length = half_neck / 3

    # Front neckline
    # EG is perpendicular to XY (horizontal), so G is to the side of E
    pts.G = (eg_length, pts.E[1])

    # GH is perpendicular to EG (vertical), so H is above G
    pts.H = (eg_length, pts.E[1] + gh_length)

    # Back neckline
    # FI is perpendicular to XY, same length as EG, but on back side
    pts.I = (-eg_length, pts.F[1])

    # Shoulder construction
    # GJ = 1/3 of GH
    gj_length = gh_length / 3
    pts.J = (pts.G[0], pts.G[1] + gj_length)

    # Shoulder line from H with measured shoulder length
    shoulder_length = m.shoulder_length
    # Shoulder slopes down approximately 3-4 cm over its length
    slope_drop = 3.0
    pts.K = (pts.H[0] + shoulder_length, pts.H[1] - slope_drop)

    # Back shoulder - similar construction from I
    # Back shoulder is slightly longer and slopes more
    pts.K_back = (pts.I[0] - shoulder_length, pts.I[1] - slope_drop - 0.5)

    return pts


def generate_curve_points(start: tuple, end: tuple, control_offset: float,
                          direction: str = 'inward', num_points: int = 20) -> list:
    """Generate points along a quadratic bezier curve."""
    sx, sy = start
    ex, ey = end

    # Calculate control point based on direction
    mid_x = (sx + ex) / 2
    mid_y = (sy + ey) / 2

    if direction == 'inward':
        # Curve bends toward center (x=0)
        ctrl_x = mid_x - abs(control_offset) * np.sign(mid_x)
        ctrl_y = mid_y
    elif direction == 'outward':
        ctrl_x = mid_x + abs(control_offset) * np.sign(mid_x) if mid_x != 0 else mid_x + control_offset
        ctrl_y = mid_y
    else:  # 'down' or custom
        ctrl_x = mid_x
        ctrl_y = mid_y - control_offset

    # Quadratic bezier
    t = np.linspace(0, 1, num_points)
    x = (1-t)**2 * sx + 2*(1-t)*t * ctrl_x + t**2 * ex
    y = (1-t)**2 * sy + 2*(1-t)*t * ctrl_y + t**2 * ey

    return list(zip(x, y))


def generate_neckline_curve(start: tuple, end: tuple, flatness_start: float,
                            is_front: bool = True, num_points: int = 30) -> list:
    """
    Generate neckline curve with flatness at center.
    start: neck depth point (H for front, at neckline edge)
    end: center point (E for front, F for back)
    flatness_start: horizontal distance of flatness from center
    """
    sx, sy = start
    ex, ey = end

    # Create curve that respects flatness at center
    # Use cubic bezier for more control
    t = np.linspace(0, 1, num_points)

    if is_front:
        # Front neckline: deep curve from H to E with 1.5cm flatness at center
        # Control points for smooth curve
        ctrl1_x = sx
        ctrl1_y = sy - (sy - ey) * 0.5
        ctrl2_x = ex + flatness_start
        ctrl2_y = ey
    else:
        # Back neckline: shallower curve with ~3cm flatness
        ctrl1_x = sx
        ctrl1_y = sy - (sy - ey) * 0.3
        ctrl2_x = ex - flatness_start  # negative x for back
        ctrl2_y = ey

    # Cubic bezier
    x = (1-t)**3 * sx + 3*(1-t)**2*t * ctrl1_x + 3*(1-t)*t**2 * ctrl2_x + t**3 * ex
    y = (1-t)**3 * sy + 3*(1-t)**2*t * ctrl1_y + 3*(1-t)*t**2 * ctrl2_y + t**3 * ey

    return list(zip(x, y))


def generate_side_seam_curve(hip_point: tuple, waist_point: tuple,
                             bust_point: tuple, num_points: int = 30) -> list:
    """Generate smooth side seam from hip through waist to bust."""
    points = []

    # Hip to waist curve (inward curve)
    hip_waist = generate_curve_points(hip_point, waist_point, 1.0, 'inward', num_points // 2)
    points.extend(hip_waist)

    # Waist to bust curve (outward curve)
    waist_bust = generate_curve_points(waist_point, bust_point, 1.5, 'outward', num_points // 2)
    points.extend(waist_bust[1:])  # Skip first point to avoid duplicate

    return points


def print_coordinates(pts: PatternPoints):
    """Print all pattern coordinates."""
    print("\n" + "="*60)
    print("PATTERN COORDINATES (in cm)")
    print("="*60)
    print("\nCenter Line Points (x=0):")
    print(f"  A (Hip level):      {pts.A}")
    print(f"  B (Waist level):    {pts.B}")
    print(f"  C (Bust level):     {pts.C}")
    print(f"  D (Shoulder ref):   {pts.D}")
    print(f"  E (Front neck):     {pts.E}")
    print(f"  F (Back neck):      {pts.F}")

    print("\nFront Side Points (positive x):")
    print(f"  A1 (Hip side):      {pts.A1}")
    print(f"  B1 (Waist side):    {pts.B1}")
    print(f"  C1 (Bust side):     {pts.C1}")
    print(f"  D1 (Shoulder width):{pts.D1}")

    print("\nBack Side Points (negative x):")
    print(f"  A1 (Hip side):      {pts.A1_back}")
    print(f"  B1 (Waist side):    {pts.B1_back}")
    print(f"  C1 (Bust side):     {pts.C1_back}")
    print(f"  D2 (Shoulder width):{pts.D2}")

    print("\nNeckline Points:")
    print(f"  G (Front neck width):  {pts.G}")
    print(f"  H (Front neck depth):  {pts.H}")
    print(f"  I (Back neck depth):   {pts.I}")

    print("\nShoulder Points:")
    print(f"  J (Shoulder ref):      {pts.J}")
    print(f"  K (Front shoulder end):{pts.K}")
    print(f"  K_back (Back shoulder):{pts.K_back}")
    print("="*60 + "\n")


def plot_pattern(pts: PatternPoints, measurements: FullMeasurements):
    """Create matplotlib visualization of the pattern."""
    fig, ax = plt.subplots(1, 1, figsize=(14, 16))

    # Colors
    front_color = '#2E86AB'  # Blue for front
    back_color = '#A23B72'   # Magenta for back
    center_color = '#1B4332' # Dark green for center line
    point_color = '#E63946'  # Red for points

    # Draw center line (XY axis)
    y_min = pts.A[1] - 5
    y_max = max(pts.E[1], pts.F[1]) + 10
    ax.axvline(x=0, color=center_color, linestyle='--', linewidth=1, alpha=0.5, label='Center line (XY)')

    # Draw horizontal reference lines
    for pt_name, pt, label in [
        ('A', pts.A, 'Hip line'),
        ('B', pts.B, 'Waist line'),
        ('C', pts.C, 'Bust line'),
    ]:
        ax.axhline(y=pt[1], color='gray', linestyle=':', linewidth=0.5, alpha=0.5)
        ax.text(-30, pt[1], label, fontsize=8, va='center', color='gray')

    # FRONT PATTERN (positive x)
    # Side seam: A1 -> B1 -> C1
    side_front = generate_side_seam_curve(pts.A1, pts.B1, pts.C1)
    side_x = [p[0] for p in side_front]
    side_y = [p[1] for p in side_front]
    ax.plot(side_x, side_y, color=front_color, linewidth=2)

    # Armhole: C1 -> D1 -> K (simplified)
    armhole_front = generate_curve_points(pts.C1, pts.K, 3.0, 'outward', 30)
    arm_x = [p[0] for p in armhole_front]
    arm_y = [p[1] for p in armhole_front]
    ax.plot(arm_x, arm_y, color=front_color, linewidth=2)

    # Shoulder: K -> H
    ax.plot([pts.K[0], pts.H[0]], [pts.K[1], pts.H[1]], color=front_color, linewidth=2)

    # Front neckline: H -> E
    neck_front = generate_neckline_curve(pts.H, pts.E, 1.5, is_front=True)
    neck_x = [p[0] for p in neck_front]
    neck_y = [p[1] for p in neck_front]
    ax.plot(neck_x, neck_y, color=front_color, linewidth=2)

    # Center front: E -> A (along x=0)
    ax.plot([pts.E[0], pts.A[0]], [pts.E[1], pts.A[1]], color=front_color, linewidth=2)

    # Bottom: A -> A1
    ax.plot([pts.A[0], pts.A1[0]], [pts.A[1], pts.A1[1]], color=front_color, linewidth=2)

    # BACK PATTERN (negative x)
    # Side seam: A1_back -> B1_back -> C1_back
    side_back = generate_side_seam_curve(pts.A1_back, pts.B1_back, pts.C1_back)
    side_x = [p[0] for p in side_back]
    side_y = [p[1] for p in side_back]
    ax.plot(side_x, side_y, color=back_color, linewidth=2)

    # Armhole: C1_back -> D2 -> K_back
    armhole_back = generate_curve_points(pts.C1_back, pts.K_back, 3.0, 'outward', 30)
    arm_x = [p[0] for p in armhole_back]
    arm_y = [p[1] for p in armhole_back]
    ax.plot(arm_x, arm_y, color=back_color, linewidth=2)

    # Shoulder: K_back -> I
    ax.plot([pts.K_back[0], pts.I[0]], [pts.K_back[1], pts.I[1]], color=back_color, linewidth=2)

    # Back neckline: I -> F
    neck_back = generate_neckline_curve(pts.I, pts.F, 3.0, is_front=False)
    neck_x = [p[0] for p in neck_back]
    neck_y = [p[1] for p in neck_back]
    ax.plot(neck_x, neck_y, color=back_color, linewidth=2)

    # Center back: F -> A (along x=0)
    ax.plot([pts.F[0], pts.A[0]], [pts.F[1], pts.A[1]], color=back_color, linewidth=2)

    # Bottom: A -> A1_back
    ax.plot([pts.A[0], pts.A1_back[0]], [pts.A[1], pts.A1_back[1]], color=back_color, linewidth=2)

    # Plot and label key points
    key_points = [
        ('A', pts.A), ('B', pts.B), ('C', pts.C), ('D', pts.D), ('E', pts.E), ('F', pts.F),
        ('A1', pts.A1), ('B1', pts.B1), ('C1', pts.C1), ('D1', pts.D1),
        ('A1\'', pts.A1_back), ('B1\'', pts.B1_back), ('C1\'', pts.C1_back), ('D2', pts.D2),
        ('G', pts.G), ('H', pts.H), ('I', pts.I), ('J', pts.J), ('K', pts.K), ('K\'', pts.K_back),
    ]

    for name, pt in key_points:
        ax.plot(pt[0], pt[1], 'o', color=point_color, markersize=5)
        offset_x = 0.8 if pt[0] >= 0 else -1.5
        ax.annotate(name, pt, xytext=(pt[0] + offset_x, pt[1] + 0.5),
                   fontsize=8, color=point_color)

    # Legend
    front_patch = mpatches.Patch(color=front_color, label='Front bodice')
    back_patch = mpatches.Patch(color=back_color, label='Back bodice')
    ax.legend(handles=[front_patch, back_patch], loc='upper right')

    # Formatting
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.3)
    ax.set_xlabel('Width (cm)')
    ax.set_ylabel('Height from hip (cm)')

    title = 'Corset Base Stretch Pattern\n(Front and Back on shared XY axis)'
    if measurements.stretched:
        title += ' [STRETCHED]'
    ax.set_title(title, fontsize=14)

    # Add measurement info
    info_text = (
        f"Measurements:\n"
        f"  Bust: {measurements.full_bust:.1f} cm\n"
        f"  Waist: {measurements.full_waist:.1f} cm\n"
        f"  Hip: {measurements.full_hip:.1f} cm\n"
        f"  Shoulder: {measurements.shoulder_length:.1f} cm"
    )
    if measurements.stretched:
        info_text += "\n  [Stretch applied]"
    ax.text(0.02, 0.98, info_text, transform=ax.transAxes, fontsize=9,
            verticalalignment='top', fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    plt.tight_layout()
    return fig, ax


def main():
    # Get measurements - choose one of these options:

    # Option 1: Standard French size (T36-T48)
    measurements = default_measurements(size=38)

    # Option 2: Individual measurements
    # measurements = individual_measurements(Person.Vivien)
    # measurements = individual_measurements(Person.Kwama)

    # Apply stretch if using stretch fabric
    # measurements.stretch(horizontal=0.3, vertical=0.1, usage=0.5)

    # Calculate pattern points
    pattern = calculate_pattern(measurements)

    # Print coordinates
    print_coordinates(pattern)

    # Generate plot
    fig, ax = plot_pattern(pattern, measurements)
    plt.savefig('corset_base_stretch_pattern.png', dpi=150, bbox_inches='tight')
    print("Pattern saved to 'corset_base_stretch_pattern.png'")
    plt.show()


if __name__ == "__main__":
    main()
