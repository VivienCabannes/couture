"""
Generate corset pattern from the terminal.

Usage:  python cli/corset.py
Output: output/corset_constructions.svg, output/corset_constructions.pdf,
        output/corset_pattern.svg, output/corset_pattern.pdf
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.core.measurements import default_measurements, individual_measurements, FullMeasurements
from app.patterns.corset import CorsetMeasurements, CorsetPattern, ControlParameters

# ── Configuration ──────────────────────────────────────────────────────

# Pick ONE way to get measurements:

# Option 1: Named individual
# fm = individual_measurements("vivien")

# Option 2: Standard French size (34–48)
fm = default_measurements(size=38)

# Option 3: Fully custom
# fm = FullMeasurements(
#     back_waist_length=41.5,
#     front_waist_length=43.0,
#     full_bust=88.0,
#     bust_height=26.0,
#     half_bust_point_distance=9.5,
#     full_waist=68.0,
#     small_hip=0.0,
#     full_hip=94.0,
#     neck_circumference=36.0,
#     half_back_width=17.5,
#     half_front_width=17.0,
#     shoulder_length=12.5,
#     armhole_circumference=40.0,
#     underarm_height=22.0,
#     arm_length=60.0,
#     upper_arm=28.0,
#     elbow_height=0.0,
#     wrist=16.0,
#     waist_to_hip=20.0,
#     crotch_depth=0.0,
#     crotch_length=0.0,
#     waist_to_knee=0.0,
#     waist_to_floor=0.0,
#     side_waist_to_floor=0.0,
# )

# Stretch (set to 0.0 for woven fabrics)
STRETCH_HORIZONTAL = 0.2
STRETCH_VERTICAL = 0.1

# Optional control parameters (uncomment to customize)
# control = ControlParameters(
#     front_neck_center=0.8,
#     back_neck_center=0.5,
#     front_neck_top=0.34,
#     back_neck_top=0.20,
#     armhole_curve=0.4,
# )
control = None

# ── Generate ───────────────────────────────────────────────────────────

output_dir = Path(__file__).resolve().parent.parent / "output"
output_dir.mkdir(exist_ok=True)

corset_m = CorsetMeasurements.from_full_measurements(fm)
pattern = CorsetPattern(corset_m, control)

if STRETCH_HORIZONTAL or STRETCH_VERTICAL:
    pattern.stretch(horizontal=STRETCH_HORIZONTAL, vertical=STRETCH_VERTICAL)

pattern.generate_output(str(output_dir / "corset"))
