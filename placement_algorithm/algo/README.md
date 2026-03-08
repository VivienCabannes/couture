# Pattern Nesting Algorithm

Implementation of pattern nesting algorithms for optimal placement of sewing pattern pieces on fabric.

## Overview

This package provides tools to solve the 2D bin packing problem for sewing pattern pieces, minimizing fabric waste and cost while respecting constraints such as:

- No overlap between pieces
- Pieces must fit within fabric width
- No rotation permitted (grain alignment)
- Support for "cut on fold" sides with folding lines
- Piece multiplicity (multiple copies needed)

## Directory Structure

```
algo/
├── __init__.py              # Package initialization
├── models.py                # Core data models (Piece, Fabric, Placement, etc.)
├── constraints.py           # Constraint checking logic
├── orchestrator.py          # Main orchestration and workflow
├── algorithms/              # Placement algorithms
│   ├── __init__.py
│   ├── base.py             # Abstract base class
│   ├── greedy.py           # Greedy algorithm (implemented)
│   ├── simulated_annealing.py  # (to be implemented)
│   ├── genetic.py          # (to be implemented)
│   └── constraint_programming.py  # (to be implemented)
├── utils/                   # Utilities (to be added)
│   ├── grid.py             # Grid discretization
│   ├── folding.py          # Folding operations
│   └── sorting.py          # Piece sorting heuristics
└── tests/                   # Unit tests (to be added)
```

## Quick Start

### Installation

```bash
# Install required dependencies
pip install shapely numpy

# Optional dependencies for advanced algorithms
pip install scipy deap ortools svgwrite
```

### Basic Usage

```python
from algo.models import Piece, Fabric, Parameters, Point
from algo.orchestrator import create_orchestrator

# Define fabric
fabric = Fabric(
    width=150.0,  # cm
    cost_per_unit_length=10.0
)

# Define pieces (simplified example)
pieces = [
    Piece(
        id="piece1",
        contour=[
            Point(0, 0),
            Point(30, 0),
            Point(30, 40),
            Point(0, 40)
        ],
        multiplicity=2,
        seam_allowance=1.0
    ),
    Piece(
        id="piece2",
        contour=[
            Point(0, 0),
            Point(20, 0),
            Point(20, 30),
            Point(0, 30)
        ],
        multiplicity=1,
        seam_allowance=1.0
    )
]

# Create orchestrator
orchestrator = create_orchestrator(
    algorithm="greedy",
    num_propositions=3,
    time_limit=30.0
)

# Solve
placements = orchestrator.solve(pieces, fabric)

# Get best placement
best = placements[0]
print(f"Fabric length needed: {best.total_length:.2f} cm")
print(f"Total cost: {best.total_cost:.2f}")
print(f"Efficiency: {best.get_efficiency():.2%}")
print(f"Valid: {best.is_valid}")
```

## Data Models

### Core Classes

- **`Point`**: 2D point with x, y coordinates
- **`Side`**: Side of a pattern piece, with optional "cut on fold" property
- **`FoldingLine`**: Line for folding/reflecting pieces
- **`Piece`**: Pattern piece with contour, sides, multiplicity, labels
- **`Fabric`**: Fabric specification with width, grain direction, cost
- **`PlacedPiece`**: Piece placed at a specific position
- **`Placement`**: Complete solution with placed pieces and metrics
- **`Parameters`**: Algorithm configuration parameters

### Key Methods

**Piece methods:**
- `get_polygon()`: Get Shapely polygon representation
- `get_bounds()`: Get bounding box
- `get_area()`: Calculate area
- `create_folded_representation()`: Expand with folding

**Placement methods:**
- `calculate_length()`: Compute fabric length used
- `calculate_cost()`: Compute total cost
- `validate()`: Check all constraints
- `get_efficiency()`: Calculate piece area / fabric area ratio

## Algorithms

### Greedy Algorithm (Implemented)

Simple bottom-left heuristic:
1. Sort pieces by size (largest first)
2. For each piece, try positions on a grid
3. Place in first valid position found

**Pros:** Fast, simple, always finds a solution if one exists
**Cons:** May not be optimal, sensitive to piece ordering

### Simulated Annealing (To be implemented)

Iterative improvement with occasional acceptance of worse solutions.

### Genetic Algorithm (To be implemented)

Population-based evolutionary approach.

### Constraint Programming (To be implemented)

Exact optimization using OR-Tools CP-SAT solver.

## Constraint Checking

The `ConstraintChecker` class validates:

- `check_overlap()`: Detect piece overlaps
- `check_within_bounds()`: Verify pieces fit in fabric
- `check_folding_valid()`: Validate folding lines can unfold
- `check_grain_alignment()`: Verify grain direction
- `check_spacing()`: Ensure minimum spacing between pieces
- `check_placement_valid()`: Comprehensive validation
- `check_multiplicity_satisfied()`: Verify all pieces placed correctly

## Parameters

### User Parameters
- `fabric_width`: Fabric width in cm
- `fabric_cost_per_unit_length`: Cost per cm of length
- `num_propositions`: Number of solutions to generate

### Advanced Parameters
- `piece_enlargement_factor`: Scale pieces for cutting inaccuracy
- `piece_spacing_factor`: Minimum spacing between pieces
- `fabric_length_step`: Rounding step for fabric length

### Internal Parameters
- `tolerance`: Numerical precision tolerance
- `max_iterations`: Maximum algorithm iterations
- `time_limit`: Time limit in seconds
- `random_seed`: Random seed for reproducibility
- `grid_cell_size`: Grid resolution for position search

## Extending the System

### Adding a New Algorithm

1. Create a new file in `algorithms/`
2. Inherit from `PlacementAlgorithm`
3. Implement `generate_placements()` method

```python
from .base import PlacementAlgorithm

class MyAlgorithm(PlacementAlgorithm):
    def generate_placements(self, pieces, fabric):
        # Your algorithm logic here
        placement = self._create_empty_placement(fabric)
        # ... place pieces ...
        return [self._finalize_placement(placement)]
```

4. Register in orchestrator's `_select_algorithm()` method

### Adding Custom Constraints

Extend `ConstraintChecker` with new validation methods:

```python
def check_custom_constraint(self, placement):
    # Your constraint logic
    return is_valid, error_message
```

## Testing

(To be implemented)

```bash
pytest algo/tests/
```

## Performance Considerations

- **Shapely operations** can be slow for complex polygons
- **Grid resolution** affects speed vs. accuracy tradeoff
- **Time limits** prevent excessive computation
- **Spatial indexing** could improve overlap checking for many pieces

## Future Work

- SVG parsing and rendering
- Simulated annealing implementation
- Genetic algorithm implementation
- Constraint programming with OR-Tools
- Grid-based discretization utilities
- Folding line utilities
- Pattern matching for oriented fabrics
- Multi-fabric support
- Interactive placement editing
- Fabric waste tracking and reuse

## References

- See `docs/pattern_placing.md` for problem specification
- See `docs/libraries.md` for library recommendations
- See `docs/architecture.md` for detailed architecture

## License

(To be determined)
