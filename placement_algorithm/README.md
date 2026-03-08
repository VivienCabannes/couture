# Pattern Nesting Algorithms

Optimal placement algorithms for sewing pattern pieces on fabric, minimizing waste and cost.

## Project Structure

```
placement_algorithm/
├── README.md                 # This file
├── requirements.txt          # Python dependencies
├── example.py                # Usage examples
│
├── docs/                     # Documentation
│   ├── pattern_placing.md              # Problem specification
│   ├── libraries.md                    # Library recommendations
│   ├── architecture.md                 # System architecture
│   ├── implementation_strategy.md      # Development roadmap
│   ├── phase_2_completion.md           # Phase 2 summary (NEW)
│   └── svg_format_guide.md             # SVG specification and examples (NEW)
│
├── examples/                 # Example patterns and outputs (NEW)
│   ├── README.md            # Examples guide
│   ├── simple_dress_pattern.svg # Example dress pattern
│   └── placement_*.svg      # Generated placement outputs
│
└── algo/                     # Implementation
    ├── README.md            # Algorithm package documentation
    ├── __init__.py
    ├── models.py            # Core data models
    ├── constraints.py       # Constraint checking
    ├── orchestrator.py      # Main orchestration (updated with SVG)
    │
    ├── svg_parser.py        # SVG file parsing (NEW)
    ├── svg_renderer.py      # SVG visualization (NEW)
    │
    ├── algorithms/          # Placement algorithms
    │   ├── base.py         # Abstract base class
    │   ├── greedy.py       # Greedy algorithm (implemented)
    │   └── ...             # Additional algorithms (Phase 3)
    │
    ├── utils/               # Utilities (to be added)
    │
    └── tests/               # Unit tests
        ├── __init__.py
        └── test_svg_integration.py  # SVG tests (NEW)
```

## Quick Start

### Installation

```bash
# Navigate to placement_algorithm directory
cd placement_algorithm

# Install dependencies
pip install -r requirements.txt
```

### Run Examples

```bash
python example.py
```

### Basic Usage

```python
from algo.models import Piece, Fabric, Point
from algo.orchestrator import create_orchestrator

# Define fabric
fabric = Fabric(width=150.0, cost_per_unit_length=10.0)

# Define pieces
pieces = [
    Piece(
        id="piece1",
        contour=[Point(0,0), Point(30,0), Point(30,40), Point(0,40)],
        multiplicity=2
    )
]

# Create orchestrator and solve
orchestrator = create_orchestrator(algorithm="greedy")
placements = orchestrator.solve(pieces, fabric)

# Get best placement
best = placements[0]
print(f"Fabric needed: {best.total_length:.2f} cm")
print(f"Cost: ${best.total_cost:.2f}")
print(f"Efficiency: {best.get_efficiency():.1%}")
```

### Using SVG Pattern Files

For real-world patterns, load pieces from SVG files:

```python
from algo.orchestrator import create_orchestrator
from algo.svg_parser import SVGParser
from algo.svg_renderer import render_placement_svg
from algo.models import Fabric
from pathlib import Path

# Parse pattern from SVG
parser = SVGParser()
pieces = parser.parse_svg_file("pattern.svg")

# Define fabric
fabric = Fabric(width=150.0, cost_per_unit_length=0.20)

# Solve
orchestrator = create_orchestrator(algorithm="greedy", num_propositions=3)
placements = orchestrator.solve(pieces, fabric)

# Save best placement as SVG
if placements[0].is_valid:
    render_placement_svg(placements[0], fabric, "output.svg")
```

For complete SVG format documentation and examples, see:
- [SVG Format Guide](docs/svg_format_guide.md) - Complete specification and examples
- [Examples Directory](examples/) - Sample pattern files and outputs

## Problem Overview

This system solves a constrained 2D bin packing problem for pattern pieces:

**Objective:** Minimize fabric length (and cost) needed to cut all pattern pieces

**Constraints:**
- Pieces must not overlap
- Pieces must fit within fabric width
- No rotation permitted (grain alignment)
- Support "cut on fold" with folding lines
- Respect piece multiplicity (multiple copies)

**Inputs:**
- Pattern pieces (SVG files with contours, labels, metadata)
- Fabric specification (width, cost, grain direction)
- Algorithm parameters

**Outputs:**
- One or more placement propositions
- Visual representation (SVG)
- Cost and efficiency metrics

## Implementation Status

### ✅ Completed (Phase 1)
- Core data models and type system
- Constraint checking logic
- Greedy placement algorithm
- Main orchestrator and workflow
- Comprehensive documentation
- Usage examples

### ✅ Completed (Phase 2)
- SVG pattern file parsing with metadata extraction
- SVG rendering of placements with styling and legends
- Orchestrator integration (solve_from_svg, save_as_svg methods)
- Comprehensive test suite (14+ tests)
- SVG format guide with real-world examples
- Example pattern files (simple dress pattern)

### ⏳ In Progress / Planned (Phase 3+)
- Simulated annealing algorithm
- Genetic algorithm
- Constraint programming solver
- Performance optimization
- Advanced folding optimizations

See [docs/phase_2_completion.md](docs/phase_2_completion.md) for detailed Phase 2 summary.
See [implementation_strategy.md](docs/implementation_strategy.md) for full development roadmap.

## Documentation

### For Users
- **Quick Start:** See above or [algo/README.md](algo/README.md)
- **Examples:** See [example.py](example.py)
- **SVG Pattern Files:** [examples/](examples/) and [docs/svg_format_guide.md](docs/svg_format_guide.md)
- **Problem Specification:** [docs/pattern_placing.md](docs/pattern_placing.md)

### For Developers
- **Phase 2 Summary:** [docs/phase_2_completion.md](docs/phase_2_completion.md)
- **Architecture:** [docs/architecture.md](docs/architecture.md)
- **Library Choices:** [docs/libraries.md](docs/libraries.md)
- **Implementation Strategy:** [docs/implementation_strategy.md](docs/implementation_strategy.md)
- **API Documentation:** See docstrings in source code

## Algorithms

### Greedy Algorithm (Implemented)
Fast bottom-left heuristic. Places pieces sequentially in first valid position.
- **Speed:** Very fast (<5s for 10 pieces)
- **Quality:** Moderate (60-70% efficiency)
- **Best for:** Quick results, simple patterns

### Simulated Annealing (Planned)
Iterative improvement with occasional acceptance of worse solutions to escape local minima.
- **Speed:** Moderate (~30s for 15 pieces)
- **Quality:** Good (75-85% efficiency)
- **Best for:** Better quality with reasonable time

### Genetic Algorithm (Planned)
Population-based evolutionary optimization.
- **Speed:** Moderate to slow (configurable)
- **Quality:** Good to excellent (75-90% efficiency)
- **Best for:** High quality results, complex patterns

### Constraint Programming (Planned)
Exact optimization using OR-Tools solver.
- **Speed:** Variable (can be slow for large problems)
- **Quality:** Optimal
- **Best for:** Small patterns (<10 pieces) where optimality matters

## Key Features

### Current (Phase 1 & 2)
- ✅ Flexible data models for pieces, fabric, placements
- ✅ Comprehensive constraint validation
- ✅ Multiple placement propositions
- ✅ Configurable algorithm parameters
- ✅ Time limits and timeout handling
- ✅ Fabric cost calculation
- ✅ Placement efficiency metrics
- ✅ SVG pattern file parsing with custom metadata
- ✅ SVG rendering with professional styling
- ✅ Support for complex piece shapes (lines, curves, Bezier paths)

### Planned (Phase 3+)
- ⏳ Multiple optimization algorithms (simulated annealing, genetic, constraint programming)
- ⏳ Interactive placement editing
- ⏳ Advanced folding optimizations
- ⏳ Pattern matching for oriented fabrics
- ⏳ Fabric waste tracking
- ⏳ Integration with Couture backend API

## Dependencies

### Core (Required)
- Python 3.8+
- shapely (polygon operations)
- numpy (numerical computations)

### Optional
- scipy (simulated annealing)
- deap (genetic algorithms)
- ortools (constraint programming)
- svgwrite (SVG output)
- svgpathtools (SVG parsing)

See [requirements.txt](requirements.txt) for complete list.

## Performance

### Current Performance (Greedy Algorithm)
- 5 pieces: <1 second
- 10 pieces: 1-3 seconds
- 20 pieces: 3-10 seconds

Performance depends on:
- Grid resolution (`grid_cell_size` parameter)
- Piece complexity
- Fabric width vs piece sizes

### Optimization Tips
1. Use coarser grid (larger `grid_cell_size`) for faster results
2. Set reasonable `time_limit` to prevent excessive computation
3. Use greedy algorithm for quick previews
4. Use advanced algorithms for final optimization

## Testing

(To be implemented)

```bash
# Run unit tests
pytest algo/tests/

# Run with coverage
pytest --cov=algo algo/tests/

# Run specific test
pytest algo/tests/test_models.py
```

## Contributing

(To be documented)

1. Follow the architecture in [docs/architecture.md](docs/architecture.md)
2. Add tests for new features
3. Update documentation
4. Follow code style (Black formatter, Ruff linter)

## Integration with Couture

This nesting algorithm is being developed as part of the Couture project, a comprehensive sewing pattern application. It will be integrated into:

- **Backend:** Pattern processing and optimization API
- **Frontend:** Interactive placement visualization and configuration
- **Mobile:** Pattern cutting guides

See main Couture documentation for integration details.

## License

(To be determined - follow main Couture project license)

## Authors

Developed as part of the Couture project.

## Acknowledgments

- Problem insights from sewing and pattern-making community
- Algorithm approaches from bin packing and computational geometry literature
- Library recommendations from Python data science ecosystem

---

For detailed documentation, see the `docs/` directory.
For implementation details, see the `algo/` directory.
For usage examples, see `example.py`.
