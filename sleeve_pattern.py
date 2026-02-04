from dataclasses import dataclass

import matplotlib.pyplot as plt
import numpy as np

from measurements import FullMeasurements


@dataclass
class SleeveMeasurements:
    """Subset of measurements specifically required for the sleeve draft."""
    armhole_circumference: float  # Tour d'emmanchure
    underarm_height: float        # Hauteur dessous de bras
    arm_length: float             # Longueur de bras
    elbow_height: float           # Hauteur coude
    wrist: float                  # Tour de poignet

    @classmethod
    def from_full_measurements(cls, fm: FullMeasurements) -> "SleeveMeasurements":
        return cls(
            armhole_circumference=fm.armhole_circumference,
            underarm_height=fm.underarm_height,
            arm_length=fm.arm_length,
            elbow_height=fm.elbow_height,
            wrist=fm.wrist,
        )

    @property
    def construction_armhole_depth(self) -> float:
        """Armhole depth for construction = 2/3 of underarm height."""
        return (2 / 3) * self.underarm_height

    @property
    def desired_wrist_width(self) -> float:
        """Wrist width with ease for sleeve bottom."""
        return self.wrist + 4.0  # 4cm ease


class SleeveBlock:
    def __init__(self, measurements: SleeveMeasurements):
        self.m = measurements
        self.points: dict[str, tuple[float, float]] = {}
        self.calculate_points()

    def calculate_points(self):
        # Y axis increases downwards (screen coordinates), X increases to the right.
        # A is (0,0)

        # --- Dimensions ---
        # AB = Sleeve Width = 3/4 Armhole Measurement + 1cm
        width = (0.75 * self.m.armhole_circumference) + 1.0

        # AC = Sleeve Length
        length = self.m.arm_length

        # AI = Height of sleeve cap = 2/3 of Armhole Depth
        cap_height = self.m.construction_armhole_depth

        # --- Rectangle ABCD ---
        self.points['A'] = (0, 0)
        self.points['B'] = (width, 0)
        self.points['C'] = (0, length)
        self.points['D'] = (width, length)

        # --- Center Line EF ---
        self.points['E'] = (width / 2, 0)
        self.points['F'] = (width / 2, length)

        # --- Biceps Line (II') ---
        # I is on AC, I' is on BD
        self.points['I'] = (0, cap_height)
        self.points['I_prime'] = (width, cap_height)

        # --- Vertical Guides (G and H) ---
        # G = 1/2 AE. Draw GG' parallel to center.
        # AE is half width. G is at quarter width.
        g_x = width / 4
        self.points['G'] = (g_x, 0)
        self.points['G1'] = (g_x, cap_height) # Intersection with biceps line

        # H = 1/2 EB. Draw HH' parallel to center.
        # H is at 3/4 width.
        h_x = (width / 2) + (width / 4)
        self.points['H'] = (h_x, 0)
        self.points['H1'] = (h_x, cap_height) # Intersection with biceps line

        # --- Cap Curve Construction Points ---

        # GG2 = 1/3 of GG1.
        # Since G is at y=0 and G1 is at y=cap_height, G2 is down 1/3 of cap_height
        self.points['G2'] = (g_x, cap_height / 3)

        # H2 = 1/2 of HH1.
        self.points['H2'] = (h_x, cap_height / 2)

        # G3: Halfway between G2 and I, perpendicular 1cm.
        # Calculate midpoint first
        mid_g2_i = (
            (self.points['G2'][0] + self.points['I'][0]) / 2,
            (self.points['G2'][1] + self.points['I'][1]) / 2
        )
        # Perpendicular vector (rotate vector I->G2 90 degrees CCW and scale)
        # Vector I to G2
        vec_i_g2 = np.array(self.points['G2']) - np.array(self.points['I'])
        # Normalize
        norm_i_g2 = vec_i_g2 / np.linalg.norm(vec_i_g2)
        # Rotate -90 degrees (for outward curve relative to the box) -> (y, -x)
        perp_i_g2 = np.array([norm_i_g2[1], -norm_i_g2[0]])
        # Point G3 is midpoint + 1cm * perp direction
        # Note: Depending on coord system, might need sign flip.
        # Here: I is left, G2 is right/up. Vector is (+x, -y). Rotated (-y, -x)?
        # Visually we want to go Up/Left (Outward).
        self.points['G3'] = tuple(np.array(mid_g2_i) + perp_i_g2 * 1.0)

        # H3: Halfway between H2 and I', perpendicular 1.5cm.
        mid_h2_ip = (
            (self.points['H2'][0] + self.points['I_prime'][0]) / 2,
            (self.points['H2'][1] + self.points['I_prime'][1]) / 2
        )
        vec_h2_ip = np.array(self.points['I_prime']) - np.array(self.points['H2'])
        norm_h2_ip = vec_h2_ip / np.linalg.norm(vec_h2_ip)
        # Rotate 90 degrees (outward/up) -> (-y, x)
        perp_h2_ip = np.array([-norm_h2_ip[1], norm_h2_ip[0]])
        self.points['H3'] = tuple(np.array(mid_h2_ip) + perp_h2_ip * 1.5)

        # --- Elbow Line ---
        # AJ = Upper arm to elbow (measure usually taken from shoulder tip)
        # Use elbow_height measurement if available and reasonable
        elbow_y = self.m.elbow_height if self.m.elbow_height > 0 else 35.0

        self.points['J'] = (0, elbow_y)
        self.points['J_prime'] = (width, elbow_y)

        # --- Wrist / Bottom ---
        # Distribute sleeve bottom width equally on both sides of F
        half_wrist = self.m.desired_wrist_width / 2
        self.points['F1'] = (self.points['F'][0] - half_wrist, length)
        self.points['F2'] = (self.points['F'][0] + half_wrist, length)

    def generate_curve_points(self, num_points=20):
        """Generates smooth curve for the cap."""
        # We need a spline or bezier through I -> G3 -> G2 -> E -> H2 -> H3 -> I'
        # For simplicity in this script, we just return the key control points sorted X
        keys = ['I', 'G3', 'G2', 'E', 'H2', 'H3', 'I_prime']
        return [self.points[k] for k in keys]

    def export_pdf(self, filename="sleeve_pattern.pdf", paper_format="A4"):
        """
        Creates a PDF using Matplotlib.
        """
        fig, ax = plt.subplots(figsize=(8.27, 11.69)) # A4 size in inches

        # Extract coordinates
        pts = self.points

        # 1. Draw Frame (Construction lines - dashed)
        frame_keys = ['A', 'B', 'D', 'C', 'A']
        ax.plot([pts[k][0] for k in frame_keys], [pts[k][1] for k in frame_keys], 'k--', linewidth=0.5, label='Construction Box')

        # 2. Draw Internal Guides
        ax.plot([pts['E'][0], pts['F'][0]], [pts['E'][1], pts['F'][1]], 'k-.', linewidth=0.5) # Center
        ax.plot([pts['I'][0], pts['I_prime'][0]], [pts['I'][1], pts['I_prime'][1]], 'k:', linewidth=0.5) # Biceps
        ax.plot([pts['J'][0], pts['J_prime'][0]], [pts['J'][1], pts['J_prime'][1]], 'k:', linewidth=0.5) # Elbow

        # Vertical cap guides
        ax.plot([pts['G'][0], pts['G1'][0]], [pts['G'][1], pts['G1'][1]], 'k:', linewidth=0.3)
        ax.plot([pts['H'][0], pts['H1'][0]], [pts['H'][1], pts['H1'][1]], 'k:', linewidth=0.3)

        # 3. Draw Final Outline (Solid)
        # Underarm seams
        ax.plot([pts['I'][0], pts['F1'][0]], [pts['I'][1], pts['F1'][1]], 'k-', linewidth=1.5)
        ax.plot([pts['I_prime'][0], pts['F2'][0]], [pts['I_prime'][1], pts['F2'][1]], 'k-', linewidth=1.5)
        # Wrist
        ax.plot([pts['F1'][0], pts['F2'][0]], [pts['F1'][1], pts['F2'][1]], 'k-', linewidth=1.5)

        # Cap Curve (Polyline for now, ideally spline)
        curve_pts = self.generate_curve_points()
        cx, cy = zip(*curve_pts)

        # Use scipy for smoothing if available, else straight lines
        try:
            from scipy.interpolate import make_interp_spline
            # Sort by X to avoid loops in spline calculation if points aren't strictly ordered
            # But here they are ordered by path. We use parameterization.
            t = np.arange(len(curve_pts))
            spl = make_interp_spline(t, np.c_[cx, cy], k=3) # Cubic spline
            t_new = np.linspace(t.min(), t.max(), 300)
            smooth_curve = spl(t_new)
            ax.plot(smooth_curve[:, 0], smooth_curve[:, 1], 'k-', linewidth=1.5)
        except ImportError:
            # Fallback to straight lines connecting control points
            ax.plot(cx, cy, 'r-', linewidth=1.5, alpha=0.7)
            print("Install scipy for smooth curves.")

        # 4. Annotate Points
        for name, coord in pts.items():
            if name in ['A', 'B', 'C', 'D', 'E', 'F', 'I', 'I_prime', 'F1', 'F2']:
                ax.text(coord[0], coord[1], f" {name}", fontsize=8, color='blue')

        # Formatting
        ax.set_aspect('equal')
        ax.invert_yaxis() # Computer graphics convention vs sewing convention
        ax.set_title("Jersey Set-In Sleeve Block")
        ax.set_xlabel("Width (cm)")
        ax.set_ylabel("Length (cm)")
        ax.grid(True, linestyle=':', alpha=0.6)

        # Write measurements on side
        info_text = (
            f"Measurements:\n"
            f"Armhole Circ: {self.m.armhole_circumference}cm\n"
            f"Arm Length: {self.m.arm_length}cm\n"
            f"Calculated Depth: {self.m.construction_armhole_depth:.1f}cm\n"
            f"Sleeve Width: {pts['B'][0]:.1f}cm"
        )
        plt.figtext(0.02, 0.02, info_text, fontsize=8, bbox=dict(facecolor='white', alpha=0.8))

        plt.savefig(filename, format='pdf')
        print(f"Pattern saved to {filename}")
        plt.close()

    def print_coordinates(self):
        print(f"{'POINT':<10} {'X (cm)':<10} {'Y (cm)':<10}")
        print("-" * 30)
        for name, (x, y) in self.points.items():
            print(f"{name:<10} {x:<10.2f} {y:<10.2f}")


# --- Example Usage ---

if __name__ == "__main__":
    from measurements import default_measurements, individual_measurements

    # Get full measurements (can use default_measurements(size=38) or individual)
    fm = default_measurements(size=38)
    # fm = individual_measurements("vivien")

    # Create sleeve-specific measurements from full measurements
    sleeve_m = SleeveMeasurements.from_full_measurements(fm)

    pattern = SleeveBlock(sleeve_m)

    # Output 1: Coordinates
    pattern.print_coordinates()

    # Output 2: PDF
    pattern.export_pdf("Sleeve_Pattern.pdf")
