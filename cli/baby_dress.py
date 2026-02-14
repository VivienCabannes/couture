"""
Generate baby dress pattern from the terminal.

Usage:  python cli/baby_dress.py
Output: output/baby_dress.svg
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.patterns.baby_dress import Params, generate_svg

# ── Configuration ──────────────────────────────────────────────────────

params = Params(
    TotalLength=50.0,
    ArmholeDepth=15.0,
    ChestHalfWidth=15.0,
    HemHalfWidth=20.0,
    NeckWidthStart=5.5,
    StrapWidth=3.0,
    FrontNeckDrop=12.0,
    BackNeckDrop=6.0,
    seam_allowance_cm=1.0,
    hem_allowance_cm=2.0,
)

# ── Generate ───────────────────────────────────────────────────────────

output_dir = Path(__file__).resolve().parent.parent / "output"
output_dir.mkdir(exist_ok=True)

generate_svg(params, filename=str(output_dir / "baby_dress.svg"))
