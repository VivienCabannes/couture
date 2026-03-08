# Architecture Design for Pattern Nesting System

## Overview

This document describes the software architecture for the pattern nesting system. The architecture is designed to be modular, testable, and extensible, allowing for different algorithmic approaches to be easily integrated and compared.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface / API                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Orchestrator                              │
│  - Parameter validation                                      │
│  - Algorithm selection                                       │
│  - Result aggregation                                        │
└────────┬────────────────────────────────────┬───────────────┘
         │                                    │
         │                                    │
┌────────▼────────────┐              ┌───────▼────────────────┐
│   Input Processor   │              │  Output Generator      │
│  - SVG parsing      │              │  - SVG rendering       │
│  - Piece creation   │              │  - Cost calculation    │
│  - Validation       │              │  - Result formatting   │
└────────┬────────────┘              └───────▲────────────────┘
         │                                    │
         │                                    │
┌────────▼────────────────────────────────────┴───────────────┐
│                    Core Domain Models                        │
│  - Piece, Fabric, Placement, Side                           │
│  - Folding line handling                                     │
└────────┬─────────────────────────────────────────────────────┘
         │
         │
┌────────▼──────────────────────────────────────────────────┐
│                 Constraint Checker                         │
│  - Overlap detection                                       │
│  - Bounds checking                                         │
│  - Folding validation                                      │
└────────▲──────────────────────────────────────────────────┘
         │
         │
┌────────┴──────────────────────────────────────────────────┐
│              Placement Algorithms (Strategy Pattern)       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   Greedy     │  │  Simulated   │  │    Genetic      │ │
│  │  Algorithm   │  │  Annealing   │  │   Algorithm     │ │
│  └──────────────┘  └──────────────┘  └─────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │ Constraint   │  │    Custom    │                      │
│  │ Programming  │  │   Hybrid     │                      │
│  └──────────────┘  └──────────────┘                      │
└───────────────────────────────────────────────────────────┘
```

## Module Structure

```
placement_algorithm/
├── algo/
│   ├── __init__.py
│   ├── models.py              # Core data models
│   ├── constraints.py         # Constraint checking logic
│   ├── geometry.py            # Geometric utility functions
│   ├── svg_parser.py          # SVG input parsing
│   ├── svg_renderer.py        # SVG output generation
│   ├── orchestrator.py        # Main orchestration logic
│   │
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── base.py            # Abstract base class for algorithms
│   │   ├── greedy.py          # Greedy placement algorithm
│   │   ├── simulated_annealing.py
│   │   ├── genetic.py         # Genetic algorithm
│   │   ├── constraint_programming.py
│   │   └── hybrid.py          # Hybrid approaches
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── grid.py            # Grid-based discretization
│   │   ├── folding.py         # Folding line utilities
│   │   └── sorting.py         # Piece sorting heuristics
│   │
│   └── tests/
│       ├── __init__.py
│       ├── test_models.py
│       ├── test_constraints.py
│       ├── test_algorithms.py
│       └── test_integration.py
│
└── docs/
    ├── pattern_placing.md     # Problem specification
    ├── libraries.md           # Library recommendations
    └── architecture.md        # This document
```

## Core Components

### 1. Data Models (`models.py`)

#### Classes:

**`Point`**
- Properties: `x`, `y`
- Methods: `translate()`, `reflect()`, `to_tuple()`

**`Side`**
- Properties: `points`, `cut_on_fold`, `fold_order`
- Methods: `is_straight()`, `length()`

**`FoldingLine`**
- Properties: `start`, `end`, `associated_pieces`
- Methods: `reflect_point()`, `reflect_polygon()`

**`Piece`**
- Properties:
  - `id`: unique identifier
  - `contour`: list of Points or Shapely Polygon
  - `sides`: list of Sides
  - `grain_direction`: vector
  - `multiplicity`: int
  - `labels`: dict
  - `folding_lines`: list of FoldingLine
  - `seam_allowance`: float
- Methods:
  - `get_polygon()`: returns Shapely polygon
  - `get_bounds()`: returns bounding box
  - `translate(dx, dy)`: move piece
  - `create_folded_representation()`: expand piece with folding
  - `get_area()`

**`Fabric`**
- Properties:
  - `width`: float
  - `grain_direction`: vector
  - `has_oriented_pattern`: bool
  - `cost_per_unit_length`: float
- Methods:
  - `get_available_width()`: returns usable width

**`PlacedPiece`**
- Properties:
  - `piece`: reference to original Piece
  - `position`: Point (translation)
  - `is_folded`: bool
  - `folding_line`: optional FoldingLine reference
- Methods:
  - `get_transformed_polygon()`: returns placed polygon
  - `get_bounds()`: returns actual bounds after placement

**`Placement`**
- Properties:
  - `fabric`: Fabric reference
  - `placed_pieces`: list of PlacedPiece
  - `total_length`: float
  - `total_cost`: float
  - `is_valid`: bool
- Methods:
  - `calculate_length()`: compute fabric length used
  - `calculate_cost()`: compute total cost
  - `validate()`: check all constraints
  - `to_svg()`: generate SVG representation

**`Parameters`**
- User parameters: `fabric_width`, `fabric_cost_per_unit_length`
- Advanced parameters: `num_propositions`, `piece_enlargement_factor`, `piece_spacing_factor`, `fabric_length_step`
- Internal parameters: `tolerance`, `max_iterations`, `time_limit`, `random_seed`, `grid_cell_size`

### 2. Constraint Checker (`constraints.py`)

#### Class: `ConstraintChecker`

**Methods:**

- `check_overlap(piece1: PlacedPiece, piece2: PlacedPiece) -> bool`
  - Uses Shapely's `intersects()` method
  - Returns True if pieces overlap

- `check_within_bounds(piece: PlacedPiece, fabric: Fabric) -> bool`
  - Verifies piece is within fabric width
  - Checks all corners and boundary points

- `check_folding_valid(piece: PlacedPiece, all_pieces: List[PlacedPiece]) -> bool`
  - Validates folding lines can unfold without overlap
  - Checks fold order is respected

- `check_placement_valid(placement: Placement) -> Tuple[bool, List[str]]`
  - Comprehensive validation of entire placement
  - Returns validation status and list of violations

- `check_grain_alignment(piece: PlacedPiece, fabric: Fabric) -> bool`
  - Verifies piece grain aligns with fabric grain
  - Since rotation is not permitted, this should always pass

### 3. Geometric Utilities (`geometry.py`)

#### Functions:

- `polygon_from_points(points: List[Point]) -> Polygon`
  - Creates Shapely polygon from point list

- `add_seam_allowance(polygon: Polygon, allowance: float) -> Polygon`
  - Uses Shapely's `buffer()` operation

- `reflect_polygon_across_line(polygon: Polygon, line: FoldingLine) -> Polygon`
  - Performs reflection transformation

- `get_bounding_box(polygon: Polygon) -> Tuple[float, float, float, float]`
  - Returns (min_x, min_y, max_x, max_y)

- `polygon_area(polygon: Polygon) -> float`
  - Returns area of polygon

- `polygons_intersect(poly1: Polygon, poly2: Polygon, tolerance: float) -> bool`
  - Checks intersection with numerical tolerance

### 4. SVG Parser (`svg_parser.py`)

#### Class: `SVGParser`

**Methods:**

- `parse_svg_file(filepath: str) -> Piece`
  - Reads SVG file
  - Extracts path data
  - Parses piece metadata from SVG elements
  - Creates Piece object

- `parse_path_data(path_string: str) -> List[Point]`
  - Converts SVG path to point list
  - Handles lines and bezier curves

- `extract_metadata(svg_element) -> dict`
  - Extracts labels, multiplicity, grain direction from SVG

### 5. SVG Renderer (`svg_renderer.py`)

#### Class: `SVGRenderer`

**Methods:**

- `render_placement(placement: Placement, filepath: str)`
  - Creates SVG file showing placement
  - Draws fabric boundaries
  - Draws each piece with labels
  - Draws folding lines
  - Adds legend and cost information

- `render_piece(placed_piece: PlacedPiece, drawing, layer)`
  - Renders individual piece
  - Adds piece labels and identifiers

- `render_folding_line(folding_line: FoldingLine, drawing, layer)`
  - Draws folding line with distinctive style

### 6. Placement Algorithms (`algorithms/`)

#### Abstract Base Class: `PlacementAlgorithm`

```python
class PlacementAlgorithm(ABC):
    def __init__(self, parameters: Parameters):
        self.parameters = parameters
    
    @abstractmethod
    def generate_placements(self, pieces: List[Piece], fabric: Fabric) -> List[Placement]:
        """Generate one or more placement propositions"""
        pass
    
    def _preprocess_pieces(self, pieces: List[Piece]) -> List[Piece]:
        """Common preprocessing: handle multiplicity, folding"""
        pass
    
    def _sort_pieces(self, pieces: List[Piece]) -> List[Piece]:
        """Sort pieces by size (largest first heuristic)"""
        pass
```

#### Concrete Implementations:

**`GreedyAlgorithm`**
- Simple first-fit approach
- Places pieces sequentially in first valid position
- Fast but may not produce optimal results

**`SimulatedAnnealingAlgorithm`**
- Start with initial placement (greedy or random)
- Iteratively perturb placement
- Accept improvements and occasional worse solutions
- Cooling schedule controls acceptance probability

**`GeneticAlgorithm`**
- Population of placements
- Fitness function: minimize fabric length
- Crossover: combine parts of two placements
- Mutation: randomly move/swap pieces
- Selection: tournament or roulette wheel

**`ConstraintProgrammingAlgorithm`**
- Formulate as CSP using OR-Tools
- Variables: piece positions
- Constraints: no overlap, within bounds, folding valid
- Objective: minimize fabric length
- Best for small instances

### 7. Orchestrator (`orchestrator.py`)

#### Class: `NestingOrchestrator`

**Methods:**

- `solve(svg_files: List[str], fabric: Fabric, parameters: Parameters) -> List[Placement]`
  - Main entry point
  - Coordinates entire workflow
  - Returns sorted list of placements (best first)

**Workflow:**
1. Validate parameters
2. Parse SVG files into Piece objects
3. Preprocess pieces (handle multiplicity, folding)
4. Select algorithm based on parameters or problem size
5. Generate placements
6. Validate placements
7. Sort by fabric usage
8. Return top N propositions

## Data Flow

```
SVG Files → SVGParser → List[Piece] → Algorithm → List[Placement] 
                                          ↓
                                    Validation (ConstraintChecker)
                                          ↓
                                    Sorting (by cost/length)
                                          ↓
                                    SVGRenderer → SVG Output Files
```

## Algorithm Selection Strategy

The orchestrator can automatically select an algorithm based on problem characteristics:

- **Small problems** (≤5 pieces): Use constraint programming for optimal solution
- **Medium problems** (6-15 pieces): Use simulated annealing or genetic algorithm
- **Large problems** (>15 pieces): Use greedy algorithm or hybrid approach
- **Time-critical**: Use greedy algorithm
- **Quality-critical**: Use genetic algorithm with more generations

## Extension Points

1. **New Algorithms**: Implement `PlacementAlgorithm` base class
2. **Custom Constraints**: Add methods to `ConstraintChecker`
3. **Alternative Input Formats**: Extend `SVGParser` or create new parser
4. **Custom Output**: Create new renderer class
5. **Optimization Goals**: Modify fitness functions in algorithms

## Testing Strategy

### Unit Tests
- Test each geometric operation
- Test constraint checking with known valid/invalid cases
- Test piece preprocessing (multiplicity, folding)

### Integration Tests
- Test complete workflow with sample data
- Test multiple algorithms on same input
- Verify output SVG validity

### Performance Tests
- Benchmark algorithms on various problem sizes
- Profile to identify bottlenecks
- Stress test with large numbers of pieces

### Validation Tests
- Ensure generated placements satisfy all constraints
- Verify fabric usage calculations are correct
- Check folding line handling is accurate

## Configuration

Configuration can be provided via:
1. Python dictionaries (programmatic use)
2. JSON files (for CLI tools)
3. Environment variables (for deployment)

Example configuration structure:
```json
{
  "fabric": {
    "width": 150,
    "cost_per_unit_length": 10,
    "has_oriented_pattern": false
  },
  "parameters": {
    "num_propositions": 5,
    "algorithm": "simulated_annealing",
    "time_limit": 60,
    "random_seed": 42
  }
}
```

## Performance Considerations

1. **Caching**: Cache geometric computations (polygons, bounds, areas)
2. **Spatial Indexing**: Use R-tree for efficient overlap checking with many pieces
3. **Parallel Processing**: Run multiple algorithm instances in parallel
4. **Early Termination**: Stop if solution quality threshold is reached
5. **Incremental Validation**: Validate constraints as pieces are placed, not just at the end

## Future Enhancements

1. **Fabric Waste Tracking**: Track unused rectangles for potential reuse
2. **Interactive Placement**: Allow manual adjustment of placements
3. **Multi-Fabric Support**: Handle multiple fabric widths/types
4. **Pattern Matching**: Align pieces for striped/patterned fabrics
5. **3D Visualization**: Show folding sequences in 3D
6. **Machine Learning**: Learn from successful placements to improve heuristics

## Conclusion

This architecture provides a solid foundation for implementing the pattern nesting system. It is:
- **Modular**: Components can be developed and tested independently
- **Extensible**: New algorithms and constraints can be easily added
- **Testable**: Clear interfaces enable comprehensive testing
- **Maintainable**: Clean separation of concerns and well-defined responsibilities
