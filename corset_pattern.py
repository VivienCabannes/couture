from dataclasses import dataclass, fields

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages

from measurements import FullMeasurements


@dataclass
class CorsetMeasurements:
    """Subset of measurements specifically required for this corset draft."""
    back_waist_length: float  # Longueur taille dos
    front_waist_length: float # Longueur taille devant
    full_bust: float          # Tour de poitrine
    bust_height: float        # Hauteur de poitrine
    full_waist: float         # Tour de taille
    full_hip: float           # Tour de bassin
    neck_circumference: float # Tour d'encollure
    half_back_width: float    # 1/2 carrure dos
    half_front_width: float   # 1/2 carrure devant
    shoulder_length: float    # Longueur d'épaule
    underarm_height: float    # Hauteur de dessous de bras
    waist_to_hip: float       # Hauteur taille-bassin

    @classmethod
    def from_full_measurements(cls, fm: FullMeasurements):
        kwargs = {f.name: getattr(fm, f.name) for f in fields(cls)}
        return cls(**kwargs)


class CorsetPattern:
    def __init__(self, measurements: CorsetMeasurements):
        self.m = measurements
        self.points = {}
        self.helper_points = {}
        self.build_construction_points()
        
        # Determine plot bounds for PDF
        print(self.points)
        xs = [p[0] for p in self.points.values()]
        ys = [p[1] for p in self.points.values()]
        self.bounds = (min(xs)-5, max(xs)+5, min(ys)-5, max(ys)+5)

    def build_construction_points(self):
        # Waist as the reference
        # B: Waist level
        self.points['B'] = np.array([0.0, 0.0])
        width = (self.m.full_waist / 4) + 1.0
        self.points['B1'] = self.points['B'] - np.array([width, 0])

        # Neck construction
        # E: Front top
        self.points['E'] = np.array([0.0, self.m.front_waist_length])
        # F: Back top
        self.points['F'] = np.array([0.0, self.m.back_waist_length + 1.0])
        # EG = 4/15 neck_circumference
        # width = 4 * self.m.neck_circumference / 15
        width = 4 * self.m.neck_circumference / 18
        self.helper_points['G'] = self.points['E'] - np.array([width, 0])
        # GH = 1/6 neck circumference.
        height = self.m.neck_circumference / 6
        self.points['H'] = self.helper_points['G'] + np.array([0, height])

        # Body construction
        # A: Hip level
        self.points['A'] = np.array([0.0, -self.m.waist_to_hip])
        width = (self.m.full_hip / 4) + 0.5
        self.points['A1'] = self.points['A'] - np.array([width, 0])
        # C: Bust level
        coordinate = self.points['E'][1] - self.m.bust_height
        self.points['C'] = np.array([0.0, coordinate])
        width = (self.m.full_bust / 4)
        self.points['C1'] = self.points['C'] - np.array([width, 0])
        # B1C2: Underarm height, prolonging B1C1
        vec_b1c1 = self.points['C1'] - self.points['B1']
        unit_vec = vec_b1c1 / np.linalg.norm(vec_b1c1)
        self.points['C2'] = self.points['B1'] + (unit_vec * self.m.underarm_height)
        
        # Shoulder construction
        # D: Shoulder level, at the middle of F and C
        self.points['D'] = (self.points['F'] + self.points['C']) / 2
        width = self.m.half_front_width + 0.3
        self.points['D1'] = self.points['D'] - np.array([width, 0])
        width = self.m.half_back_width
        self.points['D2'] = self.points['D'] - np.array([width, 0])
        # GJ = 1/3 Gh
        height = self.m.neck_circumference / 18
        self.helper_points['J'] = self.helper_points['G'] + np.array([0, height])
        # HK: shoulder length
        height = self.points['H'][1] - self.helper_points['J'][1]
        width = np.sqrt(self.m.shoulder_length ** 2 - height ** 2)
        self.points['K'] = self.helper_points['J'] - np.array([width, 0])

    def generate_pdf(self, filename="corset_pattern.pdf"):
        pp = PdfPages(filename)
        
        # --- Page 1: A4 Overview with Coordinates ---
        fig, ax = plt.subplots(figsize=(8.27, 11.69)) # A4 size inches
        self._plot_pattern(ax, annotate=True)
        ax.set_title(f"Corset Construction Draft - Overview\nFull Bust: {self.m.full_bust}cm | Full Waist: {self.m.full_waist}cm")
        pp.savefig(fig)
        plt.close()
        
        # --- Page 2: Real Size (1:1 scale) ---
        # Calculate figure size in inches (divide cm by 2.54)
        width_cm = self.bounds[1] - self.bounds[0]
        height_cm = self.bounds[3] - self.bounds[2]
        fig_real, ax_real = plt.subplots(figsize=(width_cm/2.54, height_cm/2.54))
        
        self._plot_pattern(ax_real, annotate=False)
        ax_real.set_title("Real Size Pattern (Print at 100%)")
        pp.savefig(fig_real)
        plt.close()
        
        pp.close()
        print(f"Pattern generated: {filename}")

    def _plot_pattern(self, ax, annotate=True):
        ax.set_aspect('equal')

        # Extract coordinates for plotting lines
        pts = self.points

        # Helper to draw line between keys
        def draw_line(k1, k2, style='-', color='black'):
            if k1 in pts and k2 in pts:
                ax.plot([pts[k1][0], pts[k2][0]], [pts[k1][1], pts[k2][1]], linestyle=style, color=color, linewidth=1)

        # Helper to draw cubic Bezier curve
        def draw_bezier(p0, p1, p2, p3, style='-', color='black', num_points=100):
            t = np.linspace(0, 1, num_points)
            curve = (1-t)[:, np.newaxis]**3 * p0 + \
                    3*(1-t)[:, np.newaxis]**2 * t[:, np.newaxis] * p1 + \
                    3*(1-t)[:, np.newaxis] * t[:, np.newaxis]**2 * p2 + \
                    t[:, np.newaxis]**3 * p3
            ax.plot(curve[:, 0], curve[:, 1], linestyle=style, color=color, linewidth=1)

        # Construction Grid
        draw_line('A', 'E', '--', 'gray') # Center Axis
        draw_line('A', 'A1', '--', 'gray') # Hip line
        draw_line('B', 'B1', '--', 'gray') # Waist line
        draw_line('C', 'C1', '--', 'gray') # Bust line
        draw_line('D', 'D1', '--', 'gray') # Chest line
        draw_line('E', 'G', '--', 'gray') # Neck base

        # Outline - Front
        # A1 to B1: curve starting perpendicular to A-A1 (horizontal), so starting vertically
        # The curve approaches B1 from below (direction from B toward E)
        p0_a1b1 = pts['A1']
        p3_a1b1 = pts['B1']
        # Direction at A1: perpendicular to A-A1 (which is horizontal), so vertical (0, 1)
        control_dist_a1 = np.linalg.norm(p3_a1b1 - p0_a1b1) / 3
        p1_a1b1 = p0_a1b1 + np.array([0, control_dist_a1])
        # Direction at B1: approaching from below, parallel to B-E (upward)
        vec_be = pts['E'] - pts['B']
        unit_be = vec_be / np.linalg.norm(vec_be)
        control_dist_b1 = np.linalg.norm(p3_a1b1 - p0_a1b1) / 3
        p2_a1b1 = p3_a1b1 - unit_be * control_dist_b1
        draw_bezier(p0_a1b1, p1_a1b1, p2_a1b1, p3_a1b1, '-', 'blue')

        # B1 to C2: smooth continuation, passing by C1, relatively straight
        p0_b1c2 = pts['B1']
        p3_b1c2 = pts['C2']
        # Direction at B1: continuing upward (parallel to B-E)
        p1_b1c2 = p0_b1c2 + unit_be * control_dist_b1
        # Make it pass through C1 by using C1 to guide the curve
        # Use a nearly straight path through C1
        vec_b1c1 = pts['C1'] - pts['B1']
        vec_c1c2 = pts['C2'] - pts['C1']
        dist_b1c1 = np.linalg.norm(vec_b1c1)
        dist_c1c2 = np.linalg.norm(vec_c1c2)
        # Control point near C2 should follow the C1-C2 direction for straightness
        unit_c1c2 = vec_c1c2 / dist_c1c2
        p2_b1c2 = p3_b1c2 - unit_c1c2 * (dist_c1c2 * 0.5)
        draw_bezier(p0_b1c2, p1_b1c2, p2_b1c2, p3_b1c2, '-', 'blue')

        # H to E: perpendicular to K-H at H, leaving H toward E, perpendicular to E-B at E
        p0_he = pts['H']
        p3_he = pts['E']
        # Direction at H: toward E (but must be perpendicular to K-H)
        vec_kh = pts['H'] - pts['K']
        unit_kh = vec_kh / np.linalg.norm(vec_kh)
        # Choose perpendicular direction that points toward E
        perp_kh_1 = np.array([-unit_kh[1], unit_kh[0]])
        perp_kh_2 = np.array([unit_kh[1], -unit_kh[0]])
        vec_he = pts['E'] - pts['H']
        # Pick the perpendicular that has positive dot product with H->E
        if np.dot(perp_kh_1, vec_he) > np.dot(perp_kh_2, vec_he):
            perp_kh = perp_kh_1
        else:
            perp_kh = perp_kh_2
        control_dist_h = np.linalg.norm(vec_he) / 3
        p1_he = p0_he + perp_kh * control_dist_h
        # Direction at E: perpendicular to E-B (horizontal)
        vec_eb = pts['B'] - pts['E']
        unit_eb = vec_eb / np.linalg.norm(vec_eb)
        perp_eb = np.array([-unit_eb[1], unit_eb[0]]) # Perpendicular to E-B (horizontal)
        p2_he = p3_he - perp_eb * control_dist_h
        draw_bezier(p0_he, p1_he, p2_he, p3_he, '-', 'blue')

        draw_line('H', 'K', '-', 'blue')   # Shoulder

        # C2 to K curve: leaves C2 perpendicular to C1-C2 toward main axis, passes by D1, perpendicular to H-K at K
        p0_c2k = pts['C2']
        p3_c2k = pts['K']
        # Direction at C2: perpendicular to C1-C2, toward the main axis (x=0)
        vec_c1c2 = pts['C2'] - pts['C1']
        unit_c1c2 = vec_c1c2 / np.linalg.norm(vec_c1c2)
        # Two perpendicular options
        perp_c1c2_1 = np.array([-unit_c1c2[1], unit_c1c2[0]])
        perp_c1c2_2 = np.array([unit_c1c2[1], -unit_c1c2[0]])
        # Choose the one pointing toward main axis (positive x direction from C2)
        if perp_c1c2_1[0] > perp_c1c2_2[0]:
            perp_c1c2 = perp_c1c2_1
        else:
            perp_c1c2 = perp_c1c2_2

        # Direction at K: perpendicular to H-K
        vec_hk = pts['K'] - pts['H']
        unit_hk = vec_hk / np.linalg.norm(vec_hk)
        # Choose perpendicular that points toward the curve (toward D1/C2)
        perp_hk_1 = np.array([-unit_hk[1], unit_hk[0]])
        perp_hk_2 = np.array([unit_hk[1], -unit_hk[0]])
        vec_kc2 = pts['C2'] - pts['K']
        if np.dot(perp_hk_1, vec_kc2) > np.dot(perp_hk_2, vec_kc2):
            perp_hk = perp_hk_1
        else:
            perp_hk = perp_hk_2

        # Adjust control distances to pass through D1
        dist_c2_d1 = np.linalg.norm(pts['D1'] - pts['C2'])
        dist_d1_k = np.linalg.norm(pts['K'] - pts['D1'])

        p1_c2k = p0_c2k + perp_c1c2 * dist_c2_d1 * 0.8
        p2_c2k = p3_c2k + perp_hk * dist_d1_k * 0.8
        draw_bezier(p0_c2k, p1_c2k, p2_c2k, p3_c2k, '-', 'blue')
        
        # Back Reference
        draw_line('F', 'I', '-', 'red')
        draw_line('I', 'H', ':', 'red') # Back neck approx join
        
        # Plot points
        for name, coord in pts.items():
            ax.plot(coord[0], coord[1], 'o', color='black', markersize=3)
            if annotate:
                ax.text(coord[0]+0.5, coord[1], f"{name}\n({coord[0]:.1f}, {coord[1]:.1f})", fontsize=8)

        # Plot helper points (without coordinates)
        for name, coord in self.helper_points.items():
            ax.plot(coord[0], coord[1], 'o', color='gray', markersize=2)
            if annotate:
                ax.text(coord[0]+0.5, coord[1], name, fontsize=8, color='gray')

        # Add scale reference
        ax.plot([0, 10], [min(pts['A'][1], pts['A1'][1]) - 5, min(pts['A'][1], pts['A1'][1]) - 5], linewidth=4, color='black')
        ax.text(5, min(pts['A'][1], pts['A1'][1]) - 7, "10 cm Scale", ha='center')

# --- 3. Example Usage ---

if __name__ == "__main__":
    from measurements import default_measurements, individual_measurements
    fm = default_measurements(size=38)
    fm = individual_measurements("vivien")
    fm.stretch(horizontal=.25, vertical=.1)

    corset_m = CorsetMeasurements.from_full_measurements(fm)
    pattern = CorsetPattern(corset_m)
    
    # Print Coordinates
    print("Construction Points:")
    for name, p in pattern.points.items():
        print(f"{name}: x={p[0]:.2f}, y={p[1]:.2f}")
        
    # Generate PDF
    pattern.generate_pdf("corset_pattern_output.pdf")