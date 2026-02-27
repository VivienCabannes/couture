"""
Generate sleeve pattern from the terminal.

Usage:  python cli/sleeve.py
Output: output/sleeve_constructions.svg, output/sleeve_constructions.pdf,
        output/sleeve_pattern.svg, output/sleeve_pattern.pdf
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.patterns.sleeve import SleeveMeasurements, SleevePattern, ControlParameters

# ── Configuration ──────────────────────────────────────────────────────

sleeve_m = SleeveMeasurements(
    armhole_depth=19.5,        # bodice armhole depth (e.g. 41.5 - 22)
    armhole_measurement=45.0,  # measured armhole circumference
    sleeve_length=60.0,
    upper_arm_to_elbow=35.0,
    sleeve_bottom_width=20.0,
)

# Stretch (for jersey fabrics)
STRETCH_HORIZONTAL = 0.25
STRETCH_VERTICAL = 0.1

# Optional control parameters (uncomment to customize)
# control = ControlParameters(
#     g3_perpendicular=1.0,
#     h3_perpendicular=1.5,
# )
control = None

# ── Generate ───────────────────────────────────────────────────────────

output_dir = Path(__file__).resolve().parent.parent / "output"
output_dir.mkdir(exist_ok=True)

pattern = SleevePattern(sleeve_m, control)

if STRETCH_HORIZONTAL or STRETCH_VERTICAL:
    pattern.stretch(horizontal=STRETCH_HORIZONTAL, vertical=STRETCH_VERTICAL)

pattern.generate_output(str(output_dir / "sleeve"))
