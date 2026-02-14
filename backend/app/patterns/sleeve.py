from dataclasses import dataclass

import numpy as np

from app.core.stretch_pattern import StretchPattern
from app.core.svg_renderer import SVGRenderer
from app.core.pdf_renderer import PDFRenderer
from app.core.utils import cubic_spline_to_beziers


@dataclass
class SleeveMeasurements:
    """Measurements required for the jersey set-in sleeve block.

    These measurements come from bodice construction, not body measurements.
    """
    armhole_depth: float           # Profondeur d'emmanchure (from bodice construction)
    armhole_measurement: float     # Total armhole (front + back armhole lengths)
    sleeve_length: float = 60.0    # Longueur de manche (AC = 60 cm default)
    upper_arm_to_elbow: float = 35.0  # Distance from shoulder to elbow (AJ = 35 cm default)
    sleeve_bottom_width: float = 20.0  # Largeur bas de manche (configurable)


@dataclass
class ControlParameters:
    """Control parameters for sleeve cap curve construction."""
    g3_perpendicular: float = 1.0   # Perpendicular offset for G3 (cm)
    h3_perpendicular: float = 1.5   # Perpendicular offset for H3 (cm)


class SleevePattern(StretchPattern):
    def __init__(self, measurements: SleeveMeasurements, control: ControlParameters = None):
        super().__init__()
        self.m = measurements
        self.c = control or ControlParameters()

        self.build_construction_points()
        self.build_bezier_helper_points()

        # Determine plot bounds
        all_points = list(self.points.values()) + list(self.helper_points.values())
        xs = [p[0] for p in all_points]
        ys = [p[1] for p in all_points]
        self.bounds = (min(xs) - 5, max(xs) + 5, min(ys) - 5, max(ys) + 10)

    def build_construction_points(self):
        """Build the main construction points for the sleeve pattern."""
        # Y axis increases downwards (screen coordinates), X increases to the right.
        # A is (0,0)

        # --- Dimensions ---
        # AB = Sleeve Width = 3/4 Armhole Measurement + 1cm
        width = (0.75 * self.m.armhole_measurement) + 1.0
        # TODO: should be linked to tour de bras

        # AC = Sleeve Length
        length = self.m.sleeve_length

        # AI = Height of sleeve cap = 2/3 of Armhole Depth
        cap_height = (2 / 3) * self.m.armhole_depth

        # --- Rectangle ABCD (main points) ---
        self.points['A'] = np.array([0.0, 0.0])
        self.points['B'] = np.array([width, 0.0])
        self.points['C'] = np.array([0.0, length])
        self.points['D'] = np.array([width, length])

        # --- Center Line EF (main points) ---
        self.points['E'] = np.array([width / 2, 0.0])
        self.points['F'] = np.array([width / 2, length])

        # --- Biceps Line (main points) ---
        self.points['I'] = np.array([0.0, cap_height])
        self.points["I'"] = np.array([width, cap_height])

        # --- Wrist points (main points) ---
        half_wrist = self.m.sleeve_bottom_width / 2
        self.points['F1'] = np.array([self.points['F'][0] - half_wrist, length])
        self.points['F2'] = np.array([self.points['F'][0] + half_wrist, length])

    def build_bezier_helper_points(self):
        """Compute helper points for sleeve cap curve construction.

        These helper points are used for drawing smooth curves through
        the control points. For manual drafting with a French ruler,
        only the core construction points are required.
        """
        width = self.points['B'][0]  # Get width from existing points
        cap_height = self.points['I'][1]  # Get cap height from existing points

        # --- Vertical Guides (helper points) ---
        g_x = width / 4
        self.helper_points['G'] = np.array([g_x, 0.0])
        self.helper_points['G1'] = np.array([g_x, cap_height])

        h_x = (width / 2) + (width / 4)
        self.helper_points['H'] = np.array([h_x, 0.0])
        self.helper_points['H1'] = np.array([h_x, cap_height])

        # --- Cap Curve Construction Points (main points) ---
        self.points['G2'] = np.array([g_x, cap_height / 3])
        self.points['H2'] = np.array([h_x, cap_height / 2])

        # G3: Halfway between G2 and I, perpendicular offset
        mid_g2_i = (self.points['G2'] + self.points['I']) / 2
        vec_i_g2 = self.points['G2'] - self.points['I']
        norm_i_g2 = vec_i_g2 / np.linalg.norm(vec_i_g2)
        perp_i_g2 = np.array([-norm_i_g2[1], norm_i_g2[0]])
        self.points['G3'] = mid_g2_i + perp_i_g2 * self.c.g3_perpendicular

        # H3: Halfway between H2 and I', perpendicular offset
        mid_h2_ip = (self.points['H2'] + self.points["I'"]) / 2
        vec_h2_ip = self.points["I'"] - self.points['H2']
        norm_h2_ip = vec_h2_ip / np.linalg.norm(vec_h2_ip)
        perp_h2_ip = np.array([-norm_h2_ip[1], norm_h2_ip[0]])
        self.points['H3'] = mid_h2_ip + perp_h2_ip * self.c.h3_perpendicular

        # --- Elbow Line (helper points) ---
        elbow_y = self.m.upper_arm_to_elbow
        self.helper_points['J'] = np.array([0.0, elbow_y])
        self.helper_points["J'"] = np.array([width, elbow_y])

    def generate_curve_points(self):
        """Returns control points for the sleeve cap curve."""
        # Path: I -> G3 -> G2 -> E -> H2 -> H3 -> I'
        return [
            self.points['I'],
            self.points['G3'],
            self.points['G2'],
            self.points['E'],
            self.points['H2'],
            self.points['H3'],
            self.points["I'"],
        ]

    @property
    def sleeve_cap_control(self) -> float:
        """Total length of sleeve cap path (I-G3-G2-E-H2-H3-I') as straight segments."""
        pts = self.generate_curve_points()
        total = 0.0
        for i in range(len(pts) - 1):
            dx = pts[i + 1][0] - pts[i][0]
            dy = pts[i + 1][1] - pts[i][1]
            total += np.sqrt(dx * dx + dy * dy)
        return total

    def _draw_line(self, r, k1, k2, style='-', color='black', width=1):
        """Draw line between two point keys."""
        pts = self.points
        helper = self.helper_points
        # Look up points in both dicts
        p1 = pts.get(k1) if k1 in pts else helper.get(k1)
        p2 = pts.get(k2) if k2 in pts else helper.get(k2)
        if p1 is not None and p2 is not None:
            r.line(p1[0], p1[1], p2[0], p2[1], color=color, style=style, width=width)

    def _draw_spline(self, r, curve_pts, style='-', color='blue', width=1):
        """Draw spline curve through points as cubic Bezier segments."""
        beziers = cubic_spline_to_beziers(curve_pts)
        for p0, p1, p2, p3 in beziers:
            r.bezier(p0, p1, p2, p3, color=color, style=style, width=width)

    def _plot_reference(self, r):
        """Plot reference sheet with coordinates for manual drawing."""
        pts = self.points
        helper = self.helper_points

        # --- Construction Grid (dashed gray) ---
        # Frame
        self._draw_line(r, 'A', 'B', '--', 'gray')
        self._draw_line(r, 'B', 'D', '--', 'gray')
        self._draw_line(r, 'D', 'C', '--', 'gray')
        self._draw_line(r, 'C', 'A', '--', 'gray')

        # Center line
        self._draw_line(r, 'E', 'F', '--', 'gray')

        # Biceps line
        self._draw_line(r, 'I', "I'", '--', 'gray')

        # Elbow line
        self._draw_line(r, 'J', "J'", '--', 'gray')

        # Vertical cap guides
        self._draw_line(r, 'G', 'G1', ':', 'gray', 0.5)
        self._draw_line(r, 'H', 'H1', ':', 'gray', 0.5)

        # --- Final Outline (solid blue) ---
        # Underarm seams
        self._draw_line(r, 'I', 'F1', '-', 'blue')
        self._draw_line(r, "I'", 'F2', '-', 'blue')

        # Wrist
        self._draw_line(r, 'F1', 'F2', '-', 'blue')

        # Cap Curve
        curve_pts = self.generate_curve_points()
        self._draw_spline(r, curve_pts, '-', 'blue')

        # --- Plot main points with coordinates ---
        for name, coord in pts.items():
            r.circle(coord[0], coord[1], 0.1, color='black')
            r.text(coord[0] + 0.5, coord[1], f"{name}\n({coord[0]:.1f}, {coord[1]:.1f})", size=8)

        # --- Plot helper points (smaller, gray, names only) ---
        for name, coord in helper.items():
            r.circle(coord[0], coord[1], 0.07, color='gray')
            r.text(coord[0] + 0.5, coord[1], name, size=8, color='gray')

        # --- Add scale reference ---
        min_y = max(pts['C'][1], pts['D'][1])
        r.line(0, min_y + 3, 10, min_y + 3, color='black', width=4)
        r.text(5, min_y + 5, "10 cm Scale", ha='center')

        # --- Add sleeve cap control measurement ---
        r.text(pts['E'][0], min_y + 8, f"Sleeve Cap Control: {self.sleeve_cap_control:.2f} cm",
               ha='center', size=9, color='blue')

    def _plot_printable(self, r):
        """Plot clean pattern for printing at 1:1 scale."""
        pts = self.points

        # --- Final Outline Only (solid blue) ---
        # Underarm seams
        self._draw_line(r, 'I', 'F1', '-', 'blue')
        self._draw_line(r, "I'", 'F2', '-', 'blue')

        # Wrist
        self._draw_line(r, 'F1', 'F2', '-', 'blue')

        # Cap Curve
        curve_pts = self.generate_curve_points()
        self._draw_spline(r, curve_pts, '-', 'blue')

        # --- Add scale reference ---
        min_y = max(pts['C'][1], pts['D'][1])
        r.line(0, min_y + 3, 10, min_y + 3, color='black', width=4)
        r.text(5, min_y + 5, "10 cm Scale", ha='center')

    def render_svg(self, variant: str = "construction") -> str:
        """Render pattern as SVG string.

        Args:
            variant: "construction" for reference sheet with coordinates,
                     "pattern" for clean 1:1 printable pattern.

        Returns:
            SVG content as a string.
        """
        title = None
        if variant == "construction":
            title = (f"Jersey Set-In Sleeve Block - "
                     f"Armhole: {self.m.armhole_measurement}cm | Sleeve Length: {self.m.sleeve_length}cm")

        r = SVGRenderer(self.bounds, y_flip=False, title=title)

        if variant == "construction":
            self._plot_reference(r)
        else:
            self._plot_printable(r)

        return r.to_svg()

    def render_pdf(self, variant: str = "construction") -> bytes:
        """Render pattern as PDF bytes.

        Args:
            variant: "construction" for reference sheet with coordinates,
                     "pattern" for clean 1:1 printable pattern.

        Returns:
            PDF content as bytes.
        """
        title = None
        if variant == "construction":
            title = (f"Jersey Set-In Sleeve Block - "
                     f"Armhole: {self.m.armhole_measurement}cm | Sleeve Length: {self.m.sleeve_length}cm")

        r = PDFRenderer(self.bounds, y_flip=False, title=title)

        if variant == "construction":
            self._plot_reference(r)
        else:
            self._plot_printable(r)

        return r.to_pdf()

    def generate_output(self, base_filename="sleeve"):
        """Generate pattern files in both SVG and PDF formats."""
        # --- Construction reference ---
        svg_construction = self.render_svg("construction")
        with open(f"{base_filename}_constructions.svg", "w") as f:
            f.write(svg_construction)
        pdf_construction = self.render_pdf("construction")
        with open(f"{base_filename}_constructions.pdf", "wb") as f:
            f.write(pdf_construction)

        # --- Printable pattern (1:1 scale) ---
        svg_pattern = self.render_svg("pattern")
        with open(f"{base_filename}_pattern.svg", "w") as f:
            f.write(svg_pattern)
        pdf_pattern = self.render_pdf("pattern")
        with open(f"{base_filename}_pattern.pdf", "wb") as f:
            f.write(pdf_pattern)

        print("Patterns generated:")
        print(f"  {base_filename}_constructions.svg, {base_filename}_constructions.pdf")
        print(f"  {base_filename}_pattern.svg, {base_filename}_pattern.pdf")

    def print_coordinates(self):
        print(f"{'POINT':<10} {'X (cm)':<10} {'Y (cm)':<10}")
        print("-" * 30)
        for name, (x, y) in self.points.items():
            print(f"{name:<10} {x:<10.2f} {y:<10.2f}")


# --- Example Usage ---

if __name__ == "__main__":
    # Sleeve measurements come from bodice construction
    sleeve_m = SleeveMeasurements(
        armhole_depth=41.5 - 22,
        armhole_measurement=45,
        sleeve_length=66.0,
        upper_arm_to_elbow=35.0,
        sleeve_bottom_width=20.0,
    )

    # Optional: customize control parameters
    control = ControlParameters(
        g3_perpendicular=1.0,
        h3_perpendicular=1.5,
    )

    pattern = SleevePattern(sleeve_m, control)

    # Apply stretch for jersey fabric (e.g., 25% horizontal, 10% vertical stretch)
    pattern.stretch(horizontal=0.25, vertical=0.1)

    # Output 1: Coordinates
    print("Construction Points:")
    pattern.print_coordinates()

    # Output 2: Sleeve Cap Control
    print(f"\nSleeve Cap Control: {pattern.sleeve_cap_control:.2f} cm")

    # Output 3: Generate SVG and PDF files
    pattern.generate_output("Sleeve")
