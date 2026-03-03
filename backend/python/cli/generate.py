"""CLI tool for generating sewing patterns from the command line.

Usage:
    python -m cli.generate corset [--size SIZE] [--stretch H V] [--output DIR]
    python -m cli.generate sleeve [--size SIZE] [--stretch H V] [--output DIR]
    python -m cli.generate measurements [--size SIZE]
"""

import argparse
import os
import sys
from dataclasses import fields

from app.core.measurements import FullMeasurements, default_measurements
from app.modelist.corset import (
    ControlParameters as CorsetControlParameters,
    CorsetMeasurements,
    CorsetPattern,
)
from app.modelist.sleeve import (
    ControlParameters as SleeveControlParameters,
    SleeveMeasurements,
    SleevePattern,
)

SUPPORTED_SIZES = list(range(34, 50, 2))  # 34, 36, 38, 40, 42, 44, 46, 48


def _write_pattern(pattern, name: str, output_dir: str) -> list[str]:
    """Write SVG and PDF files for a pattern, returning the list of written paths.

    Generates both construction (reference with coordinates) and printable
    (clean 1:1 scale) variants in SVG and PDF formats.

    Args:
        pattern: A pattern object with render_svg() and render_pdf() methods.
        name: Base filename (e.g. "corset_38").
        output_dir: Directory to write files into.

    Returns:
        List of file paths that were written.
    """
    os.makedirs(output_dir, exist_ok=True)
    written = []

    for variant, suffix in [("construction", "_construction"), ("pattern", "_printable")]:
        svg_path = os.path.join(output_dir, f"{name}{suffix}.svg")
        with open(svg_path, "w") as f:
            f.write(pattern.render_svg(variant=variant))
        written.append(svg_path)

        pdf_path = os.path.join(output_dir, f"{name}{suffix}.pdf")
        with open(pdf_path, "wb") as f:
            f.write(pattern.render_pdf(variant=variant))
        written.append(pdf_path)

    return written


def cmd_corset(args: argparse.Namespace) -> None:
    """Generate a corset/bodice block pattern.

    Args:
        args: Parsed CLI arguments with size, stretch, and output fields.
    """
    fm = default_measurements(args.size)
    cm = CorsetMeasurements.from_full_measurements(fm)
    control = CorsetControlParameters()
    pattern = CorsetPattern(cm, control)

    if args.stretch:
        h_stretch, v_stretch = args.stretch
        pattern.stretch(horizontal=h_stretch, vertical=v_stretch)
        print(f"Applied stretch: horizontal={h_stretch}, vertical={v_stretch}")

    name = f"corset_{args.size}"
    written = _write_pattern(pattern, name, args.output)

    print(f"Generated corset pattern for size {args.size}:")
    print(f"  Full bust:  {fm.full_bust} cm")
    print(f"  Full waist: {fm.full_waist} cm")
    print(f"  Full hip:   {fm.full_hip} cm")
    print(f"Files:")
    for path in written:
        print(f"  {path}")


def cmd_sleeve(args: argparse.Namespace) -> None:
    """Generate a sleeve pattern.

    Args:
        args: Parsed CLI arguments with size, stretch, and output fields.
    """
    fm = default_measurements(args.size)
    sm = SleeveMeasurements.from_full_measurements(fm)
    control = SleeveControlParameters()
    pattern = SleevePattern(sm, control)

    if args.stretch:
        h_stretch, v_stretch = args.stretch
        pattern.stretch(horizontal=h_stretch, vertical=v_stretch)
        print(f"Applied stretch: horizontal={h_stretch}, vertical={v_stretch}")

    name = f"sleeve_{args.size}"
    written = _write_pattern(pattern, name, args.output)

    print(f"Generated sleeve pattern for size {args.size}:")
    print(f"  Armhole circumference: {fm.armhole_circumference} cm")
    print(f"  Arm length:            {fm.arm_length} cm")
    print(f"  Upper arm:             {fm.upper_arm} cm")
    print(f"Files:")
    for path in written:
        print(f"  {path}")


def cmd_measurements(args: argparse.Namespace) -> None:
    """Print default measurements for a given size, or list all sizes.

    Args:
        args: Parsed CLI arguments with an optional size field.
    """
    if args.size is None:
        print("Available sizes:", ", ".join(str(s) for s in SUPPORTED_SIZES))
        print("Use --size SIZE to see measurements for a specific size.")
        return

    fm = default_measurements(args.size)
    print(f"Default measurements for size {args.size}:")
    print(f"{'Measurement':<30} {'Value (cm)':>10}")
    print("-" * 42)
    for f in fields(fm):
        if f.name.startswith("_"):
            continue
        value = getattr(fm, f.name)
        label = f.name.replace("_", " ").title()
        print(f"{label:<30} {value:>10.2f}")


def _validate_size(value: str) -> int:
    """Validate and return a size argument.

    Args:
        value: The raw string value from argparse.

    Returns:
        The validated size as an integer.

    Raises:
        argparse.ArgumentTypeError: If the size is not supported.
    """
    size = int(value)
    if size not in SUPPORTED_SIZES:
        raise argparse.ArgumentTypeError(
            f"Size {size} not supported. Choose from: {', '.join(str(s) for s in SUPPORTED_SIZES)}"
        )
    return size


def build_parser() -> argparse.ArgumentParser:
    """Build the argument parser with all subcommands.

    Returns:
        Configured ArgumentParser instance.
    """
    parser = argparse.ArgumentParser(
        prog="python -m cli.generate",
        description="Generate sewing patterns from default measurements.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # -- corset --
    p_corset = subparsers.add_parser("corset", help="Generate a corset/bodice block pattern")
    p_corset.add_argument("--size", type=_validate_size, default=38, help="French size (default: 38)")
    p_corset.add_argument("--stretch", type=float, nargs=2, metavar=("H", "V"),
                          help="Horizontal and vertical stretch factors (e.g. 0.2 0.1)")
    p_corset.add_argument("--output", default="output", help="Output directory (default: output/)")
    p_corset.set_defaults(func=cmd_corset)

    # -- sleeve --
    p_sleeve = subparsers.add_parser("sleeve", help="Generate a sleeve pattern")
    p_sleeve.add_argument("--size", type=_validate_size, default=38, help="French size (default: 38)")
    p_sleeve.add_argument("--stretch", type=float, nargs=2, metavar=("H", "V"),
                          help="Horizontal and vertical stretch factors (e.g. 0.25 0.1)")
    p_sleeve.add_argument("--output", default="output", help="Output directory (default: output/)")
    p_sleeve.set_defaults(func=cmd_sleeve)

    # -- measurements --
    p_meas = subparsers.add_parser("measurements", help="Print default measurements for a size")
    p_meas.add_argument("--size", type=_validate_size, default=None, help="French size (omit to list all sizes)")
    p_meas.set_defaults(func=cmd_measurements)

    return parser


def main() -> None:
    """Parse arguments and dispatch to the appropriate subcommand."""
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
