import warnings
from dataclasses import dataclass, fields

import numpy as np

from app.core.measurements import FullMeasurements
from app.core.stretch_pattern import StretchPattern
from app.core.svg_renderer import SVGRenderer
from app.core.pdf_renderer import PDFRenderer
from app.core.utils import dichotomic_search


@dataclass
class CorsetMeasurements:
    """Subset of measurements specifically required for this corset draft."""
    back_waist_length: float  # Longueur taille dos
    front_waist_length: float # Longueur taille devant
    full_bust: float          # Tour de poitrine
    bust_height: float        # Hauteur de poitrine
    full_waist: float         # Tour de taille
    full_hip: float           # Tour de bassin
    half_back_width: float    # 1/2 carrure dos
    half_front_width: float   # 1/2 carrure devant
    shoulder_length: float    # Longueur d'épaule
    underarm_height: float    # Hauteur de dessous de bras
    waist_to_hip: float       # Hauteur taille-bassin

    neck_width: float         # Largeur de cou
    neck_back_height: float   # Hauteur de cou

    @classmethod
    def from_full_measurements(cls, fm: FullMeasurements):
        kwargs = {f.name: getattr(fm, f.name) for f in fields(cls) if f.name not in ('stretched', '_horizontal', '_vertical', 'neck_width', 'neck_back_height')}

        # Take 2 as a default value for neck height
        neck_back_height = 2.0
        neck_front_height = fm.back_waist_length - fm.front_waist_length + neck_back_height

        # Solve for neck_width according to the following equation:
        #   front_arc + back_arc = neck_circumference / 2
        # using quarter ellipse approximation
        #   arc ≈ (pi/2) × sqrt((a ** 2 + b ** 2) / 2)
        # We solve numerically for f(a) = 0
        def f(a):
            return np.sqrt((a**2 + neck_back_height ** 2) / 2) + np.sqrt((a**2 + neck_front_height ** 2) / 2) - fm.neck_circumference / np.pi

        kwargs['neck_back_height'] = neck_back_height
        kwargs['neck_width'] = dichotomic_search(f, 0.01, fm.neck_circumference / np.pi)

        return cls(**kwargs)


@dataclass
class ControlParameters:
    """Control parameters for Bezier curves in the pattern."""
    front_neck_center: float = 0.8   # Ratio of neck_width (E1 horizontal offset from E)
    back_neck_center: float = 0.5    # Ratio of neck_width (F1 horizontal offset from F)
    front_neck_top: float = 0.34     # Ratio of neck_width (H1 distance from H)
    back_neck_top: float = 0.20      # Ratio of neck_width (H2 distance from H)
    armhole_curve: float = 0.4      # Ratio of underarm_height for CX1 offset from C1


class CorsetPattern(StretchPattern):
    def __init__(self, measurements: CorsetMeasurements, control: ControlParameters = None):
        super().__init__()

        self.m = measurements
        self.b = control or ControlParameters()

        self.build_construction_points()
        self.build_bezier_helper_points()

    def build_construction_points(self):
        # Waist as the reference
        # B: Waist level
        self.points['B'] = np.array([0.0, 0.0])
        width = self.m.full_waist / 4
        self.points['B1'] = self.points['B'] - np.array([width, 0])

        # Neck construction
        # E: Front top
        self.points['E'] = np.array([0.0, self.m.front_waist_length])
        # F: Back top
        self.points['F'] = np.array([0.0, self.m.back_waist_length + self.m.neck_back_height / 2])
        # Use pre-computed neck_width
        G = self.points['E'] - np.array([self.m.neck_width, 0])
        self.points['H'] = self.points['F'] + np.array([-self.m.neck_width, self.m.neck_back_height / 2])

        # Body construction
        # A: Hip level
        self.points['A'] = np.array([0.0, -self.m.waist_to_hip])
        width = self.m.full_hip / 4
        self.points['A1'] = self.points['A'] - np.array([width, 0])
        # C: Bust level
        coordinate = self.points['E'][1] - self.m.bust_height
        self.points['C'] = np.array([0.0, coordinate])
        width = self.m.full_hip / 4
        # Two construction methods
        if False:
            # C_help: defined by full_bust and bust level
            C_help = self.points['C'] - np.array([width, 0])
            # B1-C1: Underarm height, prolonging B1-C_help
            vec_b1c1 = C_help - self.points['B1']
            unit_vec = vec_b1c1 / np.linalg.norm(vec_b1c1)
            self.points['C1'] = self.points['B1'] + (unit_vec * self.m.underarm_height)
        else:
            # C1: defined by full_bust and underarm_height
            x = - width
            dx = x - self.points['B1'][0]
            dy = np.sqrt(self.m.underarm_height ** 2 - dx ** 2)
            y = self.points['B1'][1] + dy
            self.points['C1'] = np.array([x, y])

        # Shoulder construction
        # D: Shoulder level, at the middle of F and C
        self.points['D'] = (self.points['F'] + self.points['C']) / 2
        width = self.m.half_front_width
        self.points['D1'] = self.points['D'] - np.array([width, 0])
        width = self.m.half_back_width
        self.points['D2'] = self.points['D'] - np.array([width, 0])
        # Shoulder top
        # J is 1/3 of the way from G to H
        J = (2 * G + self.points['H']) / 3
        width = np.sqrt(self.m.shoulder_length ** 2 - (self.points['H'][1] - J[1]) ** 2)
        self.points['K'] = J - np.array([width, 0])

    def build_bezier_helper_points(self):
        """Compute Bezier control points for computer-generated curves.

        These helper points are only needed when drawing curves automatically.
        For manual drafting with a French ruler, only the core construction
        points from build_construction_points() are required.
        """
        # Compute actual Bezier control strengths from proportional ratios
        front_neck_center_strength = self.b.front_neck_center * self.m.neck_width
        back_neck_center_strength = self.b.back_neck_center * self.m.neck_width
        front_neck_top_strength = self.b.front_neck_top * self.m.neck_width
        back_neck_top_strength = self.b.back_neck_top * self.m.neck_width
        armhole_curve_offset = self.b.armhole_curve * self.m.underarm_height

        # Neck helpers
        self.helper_points['E1'] = self.points['E'] - np.array([front_neck_center_strength, 0])
        self.helper_points['F1'] = self.points['F'] + np.array([-back_neck_center_strength, 0])

        # H1: perpendicular to H-K at H, toward E (for front neck curve)
        vec_hk = self.points['K'] - self.points['H']
        perp_hk = np.array([-vec_hk[1], vec_hk[0]])  # rotate 90°
        perp_hk = perp_hk / np.linalg.norm(perp_hk)
        # Choose direction toward E
        if np.dot(perp_hk, self.points['E'] - self.points['H']) < 0:
            perp_hk = -perp_hk
        self.helper_points['H1'] = self.points['H'] + perp_hk * front_neck_top_strength

        # H2: perpendicular to H-K at H, toward F (for back neck curve)
        perp_hk_back = np.array([-vec_hk[1], vec_hk[0]])  # rotate 90°
        perp_hk_back = perp_hk_back / np.linalg.norm(perp_hk_back)
        # Choose direction toward F
        if np.dot(perp_hk_back, self.points['F'] - self.points['H']) < 0:
            perp_hk_back = -perp_hk_back
        self.helper_points['H2'] = self.points['H'] + perp_hk_back * back_neck_top_strength

        # Armhole helpers - inverted logic: control CX1, derive KX
        K = self.points['K']
        C1 = self.points['C1']
        B1 = self.points['B1']

        # Perpendicular direction from K (orthogonal to K-H, toward D1)
        vec_kh = self.points['H'] - K
        perp_kh = np.array([-vec_kh[1], vec_kh[0]])
        perp_kh = perp_kh / np.linalg.norm(perp_kh)
        if np.dot(perp_kh, self.points['D1'] - K) < 0:
            perp_kh = -perp_kh

        # Perpendicular direction from C1 (orthogonal to B1-C1)
        vec_b1c1 = C1 - B1
        perp_b1c1 = np.array([-vec_b1c1[1], vec_b1c1[0]])  # rotate 90°
        perp_b1c1 = perp_b1c1 / np.linalg.norm(perp_b1c1)

        # Compute CX1 and KX for X = 1, 2
        for x in ['1', '2']:
            DX = self.points[f'D{x}']

            # CX1: perpendicular to B1-C1 at C1, toward DX
            perp_dir = perp_b1c1.copy()
            if np.dot(perp_dir, DX - C1) < 0:
                perp_dir = -perp_dir
            CX1 = C1 + armhole_curve_offset * perp_dir
            self.helper_points[f'C1{x}'] = CX1

            # Solve for t such that the Bezier curve passes through DX
            # with KX constrained to be on the perpendicular from K
            # B(t) = (1-t)³K + 3(1-t)²t·KX + 3(1-t)t²·CX1 + t³C1 = DX
            # where KX = K + λ·perp_kh
            #
            # Let R(t) = DX - (1-t)²(1+2t)·K - 3(1-t)t²·CX1 - t³·C1
            # For a solution to exist, R(t) must be parallel to perp_kh:
            # R(t) × perp_kh = 0 (2D cross product)

            def residual(t):
                R = DX - (1-t)**2*(1+2*t)*K - 3*(1-t)*t**2*CX1 - t**3*C1
                return R[0]*perp_kh[1] - R[1]*perp_kh[0]  # cross product

            # Find t using Brent's method
            t = dichotomic_search(residual, 0.01, 0.99)

            # Compute λ from the solution
            R = DX - (1-t)**2*(1+2*t)*K - 3*(1-t)*t**2*CX1 - t**3*C1
            coeff = 3*(1-t)**2*t
            lambda_val = np.dot(R, perp_kh) / coeff
            KX = K + lambda_val * perp_kh
            self.helper_points[f'K{x}'] = KX

    def _validate_bezier_crossing(self, p0, p1, p2, p3, curve_name=None):
        """Validate that a Bezier curve does not cross the P0-P1 or P3-P2 lines.

        Uses analytical O(1) formula based on cross products.
        Checks both ends of the curve.
        """
        curve_id = curve_name if curve_name else "unnamed"
        valid = True

        # Check P0-P1 line crossing
        v1 = p1 - p0  # Direction P0 -> P1
        if np.linalg.norm(v1) >= 1e-10:
            # Compute cross products for P2 and P3 relative to P0-P1 line
            v2 = p2 - p0
            v3 = p3 - p0
            c2 = v2[0] * v1[1] - v2[1] * v1[0]  # cross(P2-P0, P1-P0)
            c3 = v3[0] * v1[1] - v3[1] * v1[0]  # cross(P3-P0, P1-P0)

            # Curve crosses the line if c2 and c3 have opposite signs
            if c2 * c3 < 0:
                warnings.warn(
                    f"Bezier curve '{curve_id}' crosses the P0-P1 line",
                    UserWarning
                )
                valid = False

        # Check P3-P2 line crossing
        v1_end = p2 - p3  # Direction P3 -> P2
        if np.linalg.norm(v1_end) >= 1e-10:
            # Compute cross products for P0 and P1 relative to P3-P2 line
            v0 = p0 - p3
            v1_pt = p1 - p3
            c0 = v0[0] * v1_end[1] - v0[1] * v1_end[0]  # cross(P0-P3, P2-P3)
            c1 = v1_pt[0] * v1_end[1] - v1_pt[1] * v1_end[0]  # cross(P1-P3, P2-P3)

            # Curve crosses the line if c0 and c1 have opposite signs
            if c0 * c1 < 0:
                warnings.warn(
                    f"Bezier curve '{curve_id}' crosses the P3-P2 line",
                    UserWarning
                )
                valid = False

        return valid

    def _mirror_point(self, p):
        """Mirror a point for back pattern (flip x, add offset)."""
        gap = getattr(self, 'pattern_gap', 5.0)
        return np.array([-p[0] + gap, p[1]])

    def _draw_line(self, r, k1, k2, style='-', color='black'):
        """Draw line between two point keys."""
        pts = self.points
        if k1 in pts and k2 in pts:
            r.line(pts[k1][0], pts[k1][1], pts[k2][0], pts[k2][1], color=color, style=style)

    def _draw_bezier(self, r, p0, p1, p2, p3, style='-', color='black', curve_name=None):
        """Draw cubic Bezier curve."""
        self._validate_bezier_crossing(p0, p1, p2, p3, curve_name)
        r.bezier(p0, p1, p2, p3, color=color, style=style)

    def _plot_front_curves(self, r):
        """Draw front pattern curves (blue)."""
        pts = self.points

        # Side curve: A1 → B1 → C1
        p0_a1b1 = pts['A1']
        p3_a1b1 = pts['B1']
        control_dist_a1 = np.linalg.norm(p3_a1b1 - p0_a1b1) / 3
        p1_a1b1 = p0_a1b1 + np.array([0, control_dist_a1])
        vec_be = pts['E'] - pts['B']
        unit_be = vec_be / np.linalg.norm(vec_be)
        control_dist_b1 = np.linalg.norm(p3_a1b1 - p0_a1b1) / 3
        p2_a1b1 = p3_a1b1 - unit_be * control_dist_b1
        self._draw_bezier(r, p0_a1b1, p1_a1b1, p2_a1b1, p3_a1b1, '-', 'blue', curve_name='front_side_A1_B1')

        # B1 to C1
        p0_b1c1 = pts['B1']
        p3_b1c1 = pts['C1']
        p1_b1c1 = p0_b1c1 + unit_be * control_dist_b1
        vec_b1c1 = pts['C1'] - pts['B1']
        dist_b1c1 = np.linalg.norm(vec_b1c1)
        unit_b1c1 = vec_b1c1 / dist_b1c1
        p2_b1c1 = p3_b1c1 - unit_b1c1 * (dist_b1c1 * 0.3)
        self._draw_bezier(r, p0_b1c1, p1_b1c1, p2_b1c1, p3_b1c1, '-', 'blue', curve_name='front_side_B1_C1')

        # Center line: A → E (vertical)
        r.line(pts['A'][0], pts['A'][1], pts['E'][0], pts['E'][1], color='blue')

        # Bottom edge: A → A1 (horizontal)
        r.line(pts['A'][0], pts['A'][1], pts['A1'][0], pts['A1'][1], color='blue')

        # Neck: H → E
        p0_he = pts['H']
        p3_he = pts['E']
        p1_he = self.helper_points['H1']
        p2_he = self.helper_points['E1']
        self._draw_bezier(r, p0_he, p1_he, p2_he, p3_he, '-', 'blue', curve_name='front_neck_H_E')

        # Shoulder: H → K
        r.line(pts['H'][0], pts['H'][1], pts['K'][0], pts['K'][1], color='blue')

        # Armhole: K → C1 through D1
        self._draw_bezier(r, pts['K'], self.helper_points['K1'], self.helper_points['C11'], pts['C1'], '-', 'blue', curve_name='front_armhole_K_C1')

    def _plot_back_curves(self, r):
        """Draw back pattern curves (green)."""
        pts = self.points

        # Mirrored points
        m_A1 = self._mirror_point(pts['A1'])
        m_B1 = self._mirror_point(pts['B1'])
        m_C1 = self._mirror_point(pts['C1'])

        # A1 to B1 (mirrored)
        m_p0_a1b1 = m_A1
        m_p3_a1b1 = m_B1
        m_control_dist_a1 = np.linalg.norm(m_p3_a1b1 - m_p0_a1b1) / 3
        m_p1_a1b1 = m_p0_a1b1 + np.array([0, m_control_dist_a1])
        m_vec_be = self._mirror_point(pts['E']) - self._mirror_point(pts['B'])
        m_unit_be = m_vec_be / np.linalg.norm(m_vec_be)
        m_control_dist_b1 = np.linalg.norm(m_p3_a1b1 - m_p0_a1b1) / 3
        m_p2_a1b1 = m_p3_a1b1 - m_unit_be * m_control_dist_b1
        self._draw_bezier(r, m_p0_a1b1, m_p1_a1b1, m_p2_a1b1, m_p3_a1b1, '-', 'green', curve_name='back_side_A1_B1')

        # B1 to C1 (mirrored)
        m_p0_b1c1 = m_B1
        m_p3_b1c1 = m_C1
        m_p1_b1c1 = m_p0_b1c1 + m_unit_be * m_control_dist_b1
        m_vec_b1c1 = m_C1 - m_B1
        m_dist_b1c1 = np.linalg.norm(m_vec_b1c1)
        m_unit_b1c1 = m_vec_b1c1 / m_dist_b1c1
        m_p2_b1c1 = m_p3_b1c1 - m_unit_b1c1 * (m_dist_b1c1 * 0.3)
        self._draw_bezier(r, m_p0_b1c1, m_p1_b1c1, m_p2_b1c1, m_p3_b1c1, '-', 'green', curve_name='back_side_B1_C1')

        # Center line: A → F (vertical, mirrored)
        m_A = self._mirror_point(pts['A'])
        m_F = self._mirror_point(pts['F'])
        r.line(m_A[0], m_A[1], m_F[0], m_F[1], color='green')

        # Bottom edge: A → A1 (horizontal, mirrored)
        r.line(m_A[0], m_A[1], m_A1[0], m_A1[1], color='green')

        # Neck: H → F (mirrored)
        m_H = self._mirror_point(pts['H'])
        m_p0_hf = m_H
        m_p3_hf = m_F
        m_p1_hf = self._mirror_point(self.helper_points['H2'])
        m_p2_hf = self._mirror_point(self.helper_points['F1'])
        self._draw_bezier(r, m_p0_hf, m_p1_hf, m_p2_hf, m_p3_hf, '-', 'green', curve_name='back_neck_H_F')

        # Shoulder: H → K (mirrored)
        m_K = self._mirror_point(pts['K'])
        r.line(m_H[0], m_H[1], m_K[0], m_K[1], color='green')

        # Armhole: K → C1 through D2 (mirrored)
        m_K2 = self._mirror_point(self.helper_points['K2'])
        m_C12 = self._mirror_point(self.helper_points['C12'])
        self._draw_bezier(r, m_K, m_K2, m_C12, m_C1, '-', 'green', curve_name='back_armhole_K_C1')

    def _plot_reference(self, r):
        """Plot reference sheet with coordinates for manual drawing."""
        pts = self.points

        # Construction Grid (front only)
        self._draw_line(r, 'A', 'E', '--', 'gray')  # Center Axis
        self._draw_line(r, 'A', 'A1', '--', 'gray')  # Hip line

        # Draw pattern curves
        self._plot_front_curves(r)
        self._plot_back_curves(r)

        # Plot front pattern points with coordinates (relative to B as origin)
        for name, coord in pts.items():
            if name == 'D2':
                continue  # D2 belongs to back pattern
            r.circle(coord[0], coord[1], 0.1, color='blue')
            display_x = abs(coord[0] - pts['B'][0])
            display_y = coord[1] - pts['B'][1]
            r.text(coord[0]+0.5, coord[1], f"{name}\n({display_x:.1f}, {display_y:.1f})", size=8, color='blue')

        # Plot back pattern points (mirrored) with coordinates (relative to mirrored B as origin)
        back_points = ['A', 'A1', 'B', 'B1', 'C1', 'D2', 'F', 'H', 'K']
        m_B = self._mirror_point(pts['B'])
        for name in back_points:
            if name in pts:
                m_coord = self._mirror_point(pts[name])
                r.circle(m_coord[0], m_coord[1], 0.1, color='green')
                display_x = abs(m_coord[0] - m_B[0])
                display_y = m_coord[1] - m_B[1]
                r.text(m_coord[0]+0.5, m_coord[1], f"{name}\n({display_x:.1f}, {display_y:.1f})", size=8, color='green')

        # Plot front helper points (on front pattern)
        front_helpers = ['H1', 'E1', 'C11', 'K1']
        for name in front_helpers:
            if name in self.helper_points:
                coord = self.helper_points[name]
                r.circle(coord[0], coord[1], 0.07, color='gray')
                r.text(coord[0]+0.5, coord[1], name, size=8, color='gray')

        # Plot back helper points (mirrored to back pattern)
        back_helpers = ['H2', 'F1', 'C12', 'K2']
        for name in back_helpers:
            if name in self.helper_points:
                m_coord = self._mirror_point(self.helper_points[name])
                r.circle(m_coord[0], m_coord[1], 0.07, color='gray')
                r.text(m_coord[0]+0.5, m_coord[1], name, size=8, color='gray')

        # Scale reference bar
        scale_y = min(pts['A'][1], pts['A1'][1]) - 5
        r.line(0, scale_y, 10, scale_y, color='black', width=4)
        r.text(5, scale_y - 2, "10 cm Scale", ha='center')

        # Pattern labels
        m_A = self._mirror_point(pts['A'])
        front_center_x = (pts['A'][0] + pts['A1'][0]) / 2
        back_center_x = (m_A[0] + self._mirror_point(pts['A1'])[0]) / 2
        label_y = pts['B'][1]
        r.text(front_center_x, label_y, "FRONT", size=12, ha='center', color='blue', fontweight='bold')
        r.text(back_center_x, label_y, "BACK", size=12, ha='center', color='green', fontweight='bold')

    def _plot_printable(self, r):
        """Plot clean pattern for printing at 1:1 scale."""
        pts = self.points

        # Draw pattern curves only
        self._plot_front_curves(r)
        self._plot_back_curves(r)

        # Scale reference bar
        scale_y = min(pts['A'][1], pts['A1'][1]) - 5
        r.line(0, scale_y, 10, scale_y, color='black', width=4)
        r.text(5, scale_y - 2, "10 cm Scale", ha='center')

        # Minimal labels
        m_A = self._mirror_point(pts['A'])
        front_center_x = (pts['A'][0] + pts['A1'][0]) / 2
        back_center_x = (m_A[0] + self._mirror_point(pts['A1'])[0]) / 2
        label_y = pts['B'][1]
        r.text(front_center_x, label_y, "FRONT", size=12, ha='center', color='blue', fontweight='bold')
        r.text(back_center_x, label_y, "BACK", size=12, ha='center', color='green', fontweight='bold')

    def _prepare_bounds(self):
        """Calculate pattern bounds (shared by render and generate methods)."""
        self.pattern_gap = 5.0
        xs = [p[0] for p in self.points.values()]
        ys = [p[1] for p in self.points.values()]
        min_x = min(xs) - 5
        max_x = -min(xs) + self.pattern_gap + 5
        self.bounds = (min_x, max_x, min(ys)-10, max(ys)+5)

    def render_svg(self, variant: str = "construction") -> str:
        """Render pattern as SVG string.

        Args:
            variant: "construction" for reference sheet with coordinates,
                     "pattern" for clean 1:1 printable pattern.

        Returns:
            SVG content as a string.
        """
        self._prepare_bounds()
        title = None
        if variant == "construction":
            title = f"Corset Construction Draft - Full Bust: {self.m.full_bust}cm | Full Waist: {self.m.full_waist}cm"

        r = SVGRenderer(self.bounds, y_flip=True, title=title)

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
        self._prepare_bounds()
        title = None
        if variant == "construction":
            title = f"Corset Construction Draft - Full Bust: {self.m.full_bust}cm | Full Waist: {self.m.full_waist}cm"

        r = PDFRenderer(self.bounds, y_flip=True, title=title)

        if variant == "construction":
            self._plot_reference(r)
        else:
            self._plot_printable(r)

        return r.to_pdf()

    def generate_output(self, base_filename="corset"):
        """Generate pattern files in both SVG and PDF formats."""
        self._prepare_bounds()

        # --- Construction reference (with coordinates) ---
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


if __name__ == "__main__":
    from app.core.measurements import default_measurements, individual_measurements
    fm = individual_measurements("vivien")
    fm = individual_measurements("kwama")
    fm = default_measurements(size=38)

    corset_m = CorsetMeasurements.from_full_measurements(fm)
    pattern = CorsetPattern(corset_m)
    pattern.stretch(horizontal=0.2, vertical=0.1)

    # Print Coordinates
    print("Construction Points:")
    for name, p in pattern.points.items():
        print(f"{name}: x={p[0]:.2f}, y={p[1]:.2f}")

    # Generate output files
    pattern.generate_output("corset")
