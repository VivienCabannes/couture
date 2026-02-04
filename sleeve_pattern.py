from dataclasses import dataclass

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages

from stretch_pattern import StretchPattern


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


class SleevePattern(StretchPattern):
    def __init__(self, measurements: SleeveMeasurements):
        super().__init__()
        self.m = measurements
        self.calculate_points()

        # Determine plot bounds for PDF
        all_points = list(self.points.values()) + list(self.helper_points.values())
        xs = [p[0] for p in all_points]
        ys = [p[1] for p in all_points]
        self.bounds = (min(xs) - 5, max(xs) + 5, min(ys) - 5, max(ys) + 5)

    def calculate_points(self):
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

        # G3: Halfway between G2 and I, perpendicular 1cm
        mid_g2_i = (self.points['G2'] + self.points['I']) / 2
        vec_i_g2 = self.points['G2'] - self.points['I']
        norm_i_g2 = vec_i_g2 / np.linalg.norm(vec_i_g2)
        perp_i_g2 = np.array([-norm_i_g2[1], norm_i_g2[0]])
        self.points['G3'] = mid_g2_i + perp_i_g2 * 1.0

        # H3: Halfway between H2 and I', perpendicular 1.5cm
        mid_h2_ip = (self.points['H2'] + self.points["I'"]) / 2
        vec_h2_ip = self.points["I'"] - self.points['H2']
        norm_h2_ip = vec_h2_ip / np.linalg.norm(vec_h2_ip)
        perp_h2_ip = np.array([-norm_h2_ip[1], norm_h2_ip[0]])
        self.points['H3'] = mid_h2_ip + perp_h2_ip * 1.5

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

    def generate_pdf(self, filename="sleeve_pattern.pdf"):
        """Creates a multi-page PDF with overview and real-size pattern."""
        pp = PdfPages(filename)

        # --- Page 1: A4 Overview with Coordinates ---
        fig, ax = plt.subplots(figsize=(8.27, 11.69))  # A4 size in inches
        self._plot_pattern(ax, annotate=True)
        ax.set_title(f"Jersey Set-In Sleeve Block - Overview\n"
                     f"Armhole: {self.m.armhole_measurement}cm | Sleeve Length: {self.m.sleeve_length}cm")
        pp.savefig(fig)
        plt.close()

        # --- Page 2: Real Size (1:1 scale) ---
        width_cm = self.bounds[1] - self.bounds[0]
        height_cm = self.bounds[3] - self.bounds[2]
        fig_real, ax_real = plt.subplots(figsize=(width_cm / 2.54, height_cm / 2.54))

        self._plot_pattern(ax_real, annotate=False)
        ax_real.set_title("Real Size Pattern (Print at 100%)")
        pp.savefig(fig_real)
        plt.close()

        pp.close()
        print(f"Pattern generated: {filename}")

    def _plot_pattern(self, ax, annotate=True):
        """Plot the sleeve pattern on the given axes."""
        ax.set_aspect('equal')
        ax.invert_yaxis()  # A at top, C at bottom

        pts = self.points
        helper = self.helper_points

        # Helper to draw line between points
        def draw_line(p1, p2, style='-', color='black', linewidth=1):
            ax.plot([p1[0], p2[0]], [p1[1], p2[1]], linestyle=style, color=color, linewidth=linewidth)

        # --- Construction Grid (dashed gray) ---
        # Frame
        draw_line(pts['A'], pts['B'], '--', 'gray')
        draw_line(pts['B'], pts['D'], '--', 'gray')
        draw_line(pts['D'], pts['C'], '--', 'gray')
        draw_line(pts['C'], pts['A'], '--', 'gray')

        # Center line
        draw_line(pts['E'], pts['F'], '--', 'gray')

        # Biceps line
        draw_line(pts['I'], pts["I'"], '--', 'gray')

        # Elbow line
        draw_line(helper['J'], helper["J'"], '--', 'gray')

        # Vertical cap guides
        draw_line(helper['G'], helper['G1'], ':', 'gray', 0.5)
        draw_line(helper['H'], helper['H1'], ':', 'gray', 0.5)

        # --- Final Outline (solid blue) ---
        # Underarm seams
        draw_line(pts['I'], pts['F1'], '-', 'blue')
        draw_line(pts["I'"], pts['F2'], '-', 'blue')

        # Wrist
        draw_line(pts['F1'], pts['F2'], '-', 'blue')

        # Cap Curve
        curve_pts = self.generate_curve_points()
        cx, cy = zip(*curve_pts)

        try:
            from scipy.interpolate import make_interp_spline
            t = np.arange(len(curve_pts))
            spl = make_interp_spline(t, np.c_[cx, cy], k=3)
            t_new = np.linspace(t.min(), t.max(), 300)
            smooth_curve = spl(t_new)
            ax.plot(smooth_curve[:, 0], smooth_curve[:, 1], '-', color='blue', linewidth=1)
        except ImportError:
            ax.plot(cx, cy, '-', color='blue', linewidth=1)

        # --- Plot main points ---
        for name, coord in pts.items():
            ax.plot(coord[0], coord[1], 'o', color='black', markersize=3)
            if annotate:
                ax.text(coord[0] + 0.5, coord[1], f"{name}\n({coord[0]:.1f}, {coord[1]:.1f})", fontsize=8)

        # --- Plot helper points (smaller, gray, no coordinates) ---
        for name, coord in helper.items():
            ax.plot(coord[0], coord[1], 'o', color='gray', markersize=2)
            if annotate:
                ax.text(coord[0] + 0.5, coord[1], name, fontsize=8, color='gray')

        # --- Add scale reference ---
        min_y = min(pts['C'][1], pts['D'][1])
        ax.plot([0, 10], [min_y + 3, min_y + 3], linewidth=4, color='black')
        ax.text(5, min_y + 5, "10 cm Scale", ha='center')

        # --- Add sleeve cap control measurement ---
        if annotate:
            ax.text(pts['E'][0], min_y + 8, f"Sleeve Cap Control: {self.sleeve_cap_control:.2f} cm",
                    ha='center', fontsize=9, color='blue')

    def print_coordinates(self):
        print(f"{'POINT':<10} {'X (cm)':<10} {'Y (cm)':<10}")
        print("-" * 30)
        for name, (x, y) in self.points.items():
            print(f"{name:<10} {x:<10.2f} {y:<10.2f}")


# --- Example Usage ---

if __name__ == "__main__":
    # Sleeve measurements come from bodice construction
    sleeve_m = SleeveMeasurements(
        # armhole_depth=18.5,
        armhole_depth=41.5 - 22,
        # armhole_measurement=41.5,
        armhole_measurement=45,
        sleeve_length=66.0,
        upper_arm_to_elbow=35.0,
        sleeve_bottom_width=20.0,
    )

    pattern = SleevePattern(sleeve_m)

    # Apply stretch for jersey fabric (e.g., 30% horizontal, 20% vertical stretch)
    pattern.stretch(horizontal=0.25, vertical=0.1)

    # Output 1: Coordinates
    print("Construction Points:")
    pattern.print_coordinates()

    # Output 2: Sleeve Cap Control
    print(f"\nSleeve Cap Control: {pattern.sleeve_cap_control:.2f} cm")

    # Output 3: PDF
    pattern.generate_pdf("Sleeve_Pattern.pdf")
