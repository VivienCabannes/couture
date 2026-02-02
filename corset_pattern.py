from dataclasses import dataclass, fields

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages

from measurements import FullMeasurements, default_measurements


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
        width = 4 * self.m.neck_circumference / 15
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

        # Construction Grid
        draw_line('A', 'E', '--', 'gray') # Center Axis
        draw_line('A', 'A1', '--', 'gray') # Hip line
        draw_line('B', 'B1', '--', 'gray') # Waist line
        draw_line('C', 'C1', '--', 'gray') # Bust line
        draw_line('D', 'D1', '--', 'gray') # Chest line
        draw_line('E', 'G', '--', 'gray') # Neck base
        
        # Outline - Front
        draw_line('A1', 'B1', '-', 'blue') # Hip curve (straight approx)
        draw_line('B1', 'C2', '-', 'blue') # Side seam
        draw_line('H', 'E', '-', 'blue')   # Front Neck curve (straight approx)
        draw_line('H', 'K', '-', 'blue')   # Shoulder
        
        # Armhole Guide
        draw_line('C2', 'D1', ':', 'green')
        draw_line('D1', 'K', ':', 'green')
        
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
    # Example measurements (Standard Size 38 approx)
    fm = default_measurements(size=38)

    corset_m = CorsetMeasurements.from_full_measurements(fm)
    pattern = CorsetPattern(corset_m)
    
    # Print Coordinates
    print("Construction Points:")
    for name, p in pattern.points.items():
        print(f"{name}: x={p[0]:.2f}, y={p[1]:.2f}")
        
    # Generate PDF
    pattern.generate_pdf("corset_pattern_output.pdf")