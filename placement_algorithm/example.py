"""
Example usage of the pattern nesting algorithm.

This script demonstrates how to use the nesting system with simple rectangular pieces.
"""

from algo.models import Piece, Fabric, Parameters, Point
from algo.orchestrator import create_orchestrator


def create_rectangular_piece(
    piece_id: str,
    width: float,
    height: float,
    multiplicity: int = 1,
    seam_allowance: float = 1.0
) -> Piece:
    """
    Create a simple rectangular piece.
    
    Args:
        piece_id: Unique identifier for the piece
        width: Width in cm
        height: Height in cm
        multiplicity: Number of copies needed
        seam_allowance: Seam allowance in cm
    
    Returns:
        Piece object
    """
    contour = [
        Point(0, 0),
        Point(width, 0),
        Point(width, height),
        Point(0, height)
    ]
    
    return Piece(
        id=piece_id,
        contour=contour,
        multiplicity=multiplicity,
        seam_allowance=seam_allowance,
        labels={"name": piece_id, "dimensions": f"{width}x{height}cm"}
    )


def example_simple_placement():
    """Example with simple rectangular pieces."""
    print("=" * 60)
    print("EXAMPLE 1: Simple Rectangular Pieces")
    print("=" * 60)
    
    # Define fabric
    fabric = Fabric(
        width=150.0,  # 150 cm width
        cost_per_unit_length=0.15  # 15 cents per cm = $15/meter
    )
    
    # Define pieces
    pieces = [
        create_rectangular_piece("front", 40, 60, multiplicity=2, seam_allowance=1.5),
        create_rectangular_piece("back", 40, 60, multiplicity=2, seam_allowance=1.5),
        create_rectangular_piece("sleeve", 30, 50, multiplicity=2, seam_allowance=1.5),
        create_rectangular_piece("collar", 20, 15, multiplicity=1, seam_allowance=1.0),
    ]
    
    print(f"\nFabric: {fabric.width}cm wide, ${fabric.cost_per_unit_length}/cm")
    print(f"\nPieces to place:")
    for piece in pieces:
        w = piece.get_width(include_seam_allowance=False)
        h = piece.get_height(include_seam_allowance=False)
        print(f"  - {piece.id}: {w:.1f}x{h:.1f}cm, "
              f"qty={piece.multiplicity}, seam={piece.seam_allowance}cm")
    
    # Create orchestrator
    orchestrator = create_orchestrator(
        algorithm="greedy",
        num_propositions=3,
        time_limit=10.0,
        grid_cell_size=1.0
    )
    
    print("\nGenerating placements...")
    
    # Solve
    placements = orchestrator.solve(pieces, fabric)
    
    print(f"\nGenerated {len(placements)} placement(s)\n")
    
    # Display results
    for i, placement in enumerate(placements, 1):
        print(f"Placement {i}:")
        print(f"  Valid: {placement.is_valid}")
        print(f"  Fabric length: {placement.total_length:.2f} cm ({placement.total_length/100:.2f} m)")
        print(f"  Total cost: ${placement.total_cost:.2f}")
        print(f"  Efficiency: {placement.get_efficiency():.1%}")
        print(f"  Pieces placed: {len(placement.placed_pieces)}")
        
        if not placement.is_valid:
            print(f"  Errors: {', '.join(placement.validation_errors)}")
        
        if "statistics" in placement.metadata:
            stats = placement.metadata["statistics"]
            print(f"  Fabric area: {stats['fabric_area']:.0f} cm²")
            print(f"  Piece area: {stats['total_piece_area']:.0f} cm²")
        
        print()


def example_varied_sizes():
    """Example with pieces of varied sizes."""
    print("=" * 60)
    print("EXAMPLE 2: Varied Size Pieces")
    print("=" * 60)
    
    # Define fabric
    fabric = Fabric(
        width=120.0,  # Narrower fabric
        cost_per_unit_length=0.12
    )
    
    # Define pieces of varying sizes
    pieces = [
        create_rectangular_piece("large", 50, 70, multiplicity=1),
        create_rectangular_piece("medium1", 35, 45, multiplicity=2),
        create_rectangular_piece("medium2", 30, 40, multiplicity=1),
        create_rectangular_piece("small1", 20, 25, multiplicity=4),
        create_rectangular_piece("small2", 15, 20, multiplicity=2),
        create_rectangular_piece("tiny", 10, 12, multiplicity=6),
    ]
    
    print(f"\nFabric: {fabric.width}cm wide")
    print(f"Total pieces (including multiplicity): "
          f"{sum(p.multiplicity for p in pieces)}")
    
    # Create orchestrator with finer grid
    orchestrator = create_orchestrator(
        algorithm="greedy",
        num_propositions=5,
        time_limit=30.0,
        grid_cell_size=0.5  # Finer grid for better placement
    )
    
    print("\nGenerating placements...")
    
    # Solve
    placements = orchestrator.solve(pieces, fabric)
    
    if placements:
        best = placements[0]
        print(f"\nBest placement:")
        print(f"  Fabric needed: {best.total_length:.2f} cm ({best.total_length/100:.2f} m)")
        print(f"  Cost: ${best.total_cost:.2f}")
        print(f"  Efficiency: {best.get_efficiency():.1%}")
        print(f"  Valid: {best.is_valid}")
    else:
        print("\nNo valid placement found!")


def example_with_parameters():
    """Example demonstrating different parameter settings."""
    print("=" * 60)
    print("EXAMPLE 3: Parameter Comparison")
    print("=" * 60)
    
    # Define fabric and pieces
    fabric = Fabric(width=100.0, cost_per_unit_length=0.10)
    pieces = [
        create_rectangular_piece("A", 30, 40, multiplicity=2),
        create_rectangular_piece("B", 25, 35, multiplicity=2),
        create_rectangular_piece("C", 20, 30, multiplicity=1),
    ]
    
    # Try different grid sizes
    grid_sizes = [2.0, 1.0, 0.5]
    
    for grid_size in grid_sizes:
        print(f"\n--- Grid size: {grid_size} cm ---")
        
        orchestrator = create_orchestrator(
            algorithm="greedy",
            num_propositions=1,
            time_limit=10.0,
            grid_cell_size=grid_size
        )
        
        placements = orchestrator.solve(pieces, fabric)
        
        if placements and placements[0].is_valid:
            p = placements[0]
            print(f"Fabric length: {p.total_length:.2f} cm")
            print(f"Efficiency: {p.get_efficiency():.1%}")
        else:
            print("No valid placement found")


def example_with_svg():
    """Example loading pieces from an SVG pattern file."""
    print("=" * 60)
    print("EXAMPLE 4: Loading Pieces from SVG Pattern File")
    print("=" * 60)
    
    from pathlib import Path
    from algo.svg_parser import SVGParser
    from algo.svg_renderer import render_placement_svg
    
    # Path to the example SVG file
    svg_file = Path(__file__).parent / "examples" / "simple_dress_pattern.svg"
    
    if not svg_file.exists():
        print(f"\nSVG file not found: {svg_file}")
        print("To use this example, create an SVG pattern file with custom attributes.")
        print("See docs/svg_format_guide.md for details.")
        return
    
    print(f"\nLoading SVG pattern from: {svg_file.name}")
    
    # Parse SVG to get pieces
    parser = SVGParser()
    try:
        pieces = parser.parse_svg_file(str(svg_file))
    except Exception as e:
        print(f"Error parsing SVG: {e}")
        return
    
    print(f"\nParsed {len(pieces)} unique piece design(s):")
    total_copies = 0
    for piece in pieces:
        w = piece.get_width(include_seam_allowance=False)
        h = piece.get_height(include_seam_allowance=False)
        total_copies += piece.multiplicity
        print(f"  - {piece.id}: {w:.1f}x{h:.1f}cm, "
              f"qty={piece.multiplicity}, seam={piece.seam_allowance}cm")
    
    print(f"Total pieces needed (with multiplicity): {total_copies}")
    
    # Define fabric
    fabric = Fabric(
        width=150.0,  # Standard fabric width
        cost_per_unit_length=0.20
    )
    
    print(f"\nFabric: {fabric.width}cm wide, ${fabric.cost_per_unit_length}/cm")
    
    # Create orchestrator
    orchestrator = create_orchestrator(
        algorithm="greedy",
        num_propositions=3,
        time_limit=15.0,
        grid_cell_size=0.5
    )
    
    print("\nGenerating placements...")
    
    # Solve
    placements = orchestrator.solve(pieces, fabric)
    
    if not placements:
        print("No valid placement found!")
        return
    
    print(f"\nGenerated {len(placements)} placement(s)\n")
    
    # Display results
    for i, placement in enumerate(placements, 1):
        print(f"Placement {i}:")
        print(f"  Fabric length: {placement.total_length:.2f} cm ({placement.total_length/100:.2f} m)")
        print(f"  Total cost: ${placement.total_cost:.2f}")
        print(f"  Efficiency: {placement.get_efficiency():.1%}")
        print(f"  Valid: {placement.is_valid}")
        
        if placement.is_valid:
            # Optionally render to SVG
            output_svg = Path(__file__).parent / "examples" / f"placement_{i}.svg"
            try:
                render_placement_svg(placement, fabric, str(output_svg))
                print(f"  ✓ Output saved to: {output_svg.name}")
            except Exception as e:
                print(f"  ✗ Could not save SVG output: {e}")
        else:
            print(f"  Errors: {', '.join(placement.validation_errors)}")
        
        print()


def main():
    """Run all examples."""
    try:
        example_simple_placement()
        print("\n\n")
        
        example_varied_sizes()
        print("\n\n")
        
        example_with_parameters()
        print("\n\n")
        
        example_with_svg()
        
    except ImportError as e:
        print(f"Error: Missing required library: {e}")
        print("\nPlease install required dependencies:")
        print("  pip install shapely numpy")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
