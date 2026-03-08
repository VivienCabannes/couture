# Library Recommendations for Pattern Nesting Problem

## Overview

This document outlines the recommended Python libraries for implementing the pattern nesting solution described in `pattern_placing.md`. The problem is a constrained 2D bin packing/nesting problem with specific requirements for fabric cutting.

## Core Libraries

### 1. Geometry and Computational Geometry

#### **Shapely** (Primary recommendation)
- **Purpose**: Polygon operations, intersection detection, containment checks
- **Key features**:
  - Robust geometric operations (union, intersection, difference)
  - Polygon validity checking
  - Distance calculations and buffering (for seam allowances)
  - Well-documented and widely used
- **Installation**: `pip install shapely`
- **Use cases**:
  - Representing piece contours as polygons
  - Checking if pieces overlap
  - Verifying pieces are within fabric bounds
  - Adding seam allowances (buffer operation)
  - Handling folding/reflection operations

#### **svg.path** or **svgpathtools**
- **Purpose**: Parsing SVG path data
- **Key features**:
  - Parse SVG path elements (lines, bezier curves)
  - Convert to geometric representations
- **Installation**: `pip install svg.path` or `pip install svgpathtools`
- **Use cases**:
  - Reading SVG files representing pattern pieces
  - Extracting contour information

#### **NumPy**
- **Purpose**: Numerical operations and array handling
- **Key features**:
  - Efficient array operations
  - Matrix transformations (for reflections)
  - Grid-based discretization
- **Installation**: `pip install numpy`
- **Use cases**:
  - Coordinate transformations
  - Grid-based piece representation (for heuristic algorithms)
  - Numerical computations

### 2. Optimization and Algorithms

#### **Google OR-Tools** (Recommended for exact/constraint-based approaches)
- **Purpose**: Constraint programming and optimization
- **Key features**:
  - CP-SAT solver for constraint satisfaction problems
  - Integer programming capabilities
  - Well-documented with many examples
- **Installation**: `pip install ortools`
- **Use cases**:
  - Formulating the nesting problem as a constraint satisfaction problem
  - Finding optimal placements for small problem instances
  - Enforcing no-overlap and containment constraints

#### **DEAP** (Recommended for genetic algorithms)
- **Purpose**: Evolutionary algorithms framework
- **Key features**:
  - Genetic algorithm implementations
  - Multi-objective optimization support
  - Flexible fitness functions
- **Installation**: `pip install deap`
- **Use cases**:
  - Implementing genetic algorithm approach
  - Exploring large solution spaces
  - Multi-objective optimization (minimize fabric usage and cost)

#### **SciPy**
- **Purpose**: Scientific computing and optimization
- **Key features**:
  - Various optimization algorithms
  - Random number generation
  - Spatial data structures (KDTree for neighbor searches)
- **Installation**: `pip install scipy`
- **Use cases**:
  - Simulated annealing implementation
  - Random number generation with seed control
  - Spatial indexing for efficient overlap checking

### 3. Visualization and Output

#### **svgwrite**
- **Purpose**: Generating SVG output files
- **Key features**:
  - Programmatic SVG creation
  - Support for paths, rectangles, text, groups
  - Layer management
- **Installation**: `pip install svgwrite`
- **Use cases**:
  - Generating visual representations of placements
  - Drawing piece boundaries, labels, and folding lines
  - Creating multiple proposition outputs

#### **matplotlib** (Optional, for debugging)
- **Purpose**: Plotting and visualization
- **Key features**:
  - Quick visualization of geometric objects
  - Debugging placement algorithms
- **Installation**: `pip install matplotlib`
- **Use cases**:
  - Debugging polygon operations
  - Visualizing intermediate algorithm states
  - Quick prototyping

### 4. Data Handling

#### **Pydantic**
- **Purpose**: Data validation and settings management
- **Key features**:
  - Type-safe data models
  - Automatic validation
  - JSON schema generation
- **Installation**: `pip install pydantic`
- **Use cases**:
  - Defining data models for pieces, fabric, placements
  - Validating user parameters
  - API integration (if needed)

#### **dataclasses** (Built-in alternative)
- **Purpose**: Simple data classes
- **Key features**:
  - Part of Python standard library
  - Lightweight data structures
- **Use cases**:
  - Defining simple data models without external dependencies

## Algorithm-Specific Recommendations

### For Greedy Algorithms
- **Required**: Shapely, NumPy, svgwrite
- **Optional**: matplotlib (debugging)
- **Rationale**: Simple geometric operations are sufficient

### For Simulated Annealing
- **Required**: Shapely, NumPy, SciPy, svgwrite
- **Optional**: matplotlib (debugging)
- **Rationale**: SciPy provides good random number generation and annealing utilities

### For Genetic Algorithms
- **Required**: Shapely, NumPy, DEAP, svgwrite
- **Optional**: matplotlib (debugging)
- **Rationale**: DEAP provides a robust framework for evolutionary algorithms

### For Constraint Programming
- **Required**: Shapely, NumPy, OR-Tools, svgwrite
- **Optional**: matplotlib (debugging)
- **Rationale**: OR-Tools is powerful for exact solutions on smaller instances

### For Grid-Based (N-omino) Approaches
- **Required**: NumPy, Shapely, svgwrite
- **Optional**: matplotlib, networkx
- **Rationale**: Grid representation requires efficient array operations

## Additional Utilities

### **pytest**
- **Purpose**: Testing framework
- **Installation**: `pip install pytest`
- **Use cases**:
  - Unit testing geometric operations
  - Testing constraint checking
  - Validating algorithm outputs

### **black** and **ruff**
- **Purpose**: Code formatting and linting
- **Installation**: `pip install black ruff`
- **Use cases**:
  - Maintaining code quality
  - Consistent formatting

## Installation Summary

Minimal installation for greedy algorithm:
```bash
pip install shapely numpy svgwrite svg.path pydantic
```

Full installation for all algorithms:
```bash
pip install shapely numpy scipy ortools deap svgwrite svg.path svgpathtools pydantic matplotlib pytest black ruff
```

## Library Trade-offs

### Shapely vs. Custom Geometry
- **Shapely**: Robust, well-tested, but may have performance overhead
- **Custom**: Faster for specific operations, but requires more development time
- **Recommendation**: Start with Shapely, optimize critical paths if needed

### OR-Tools vs. Custom Constraint Solver
- **OR-Tools**: Powerful, well-documented, handles complex constraints
- **Custom**: More control over algorithm behavior
- **Recommendation**: Use OR-Tools for exact solutions on small instances, custom heuristics for larger ones

### DEAP vs. Custom Genetic Algorithm
- **DEAP**: Feature-rich, flexible, well-maintained
- **Custom**: More control over operators and selection strategies
- **Recommendation**: Start with DEAP, customize if needed

## Performance Considerations

1. **Shapely operations** can be slow for complex polygons. Consider:
   - Simplifying polygons when appropriate
   - Using spatial indexing (R-tree) for overlap checks
   - Caching geometric computations

2. **Grid-based approaches** trade accuracy for speed:
   - Fine grids (small cell size) are more accurate but slower
   - Coarse grids are faster but may miss valid placements

3. **Constraint programming** may not scale to large instances:
   - Use time limits to avoid excessive computation
   - Consider hybrid approaches (heuristic + local optimization)

## Conclusion

For a robust implementation that balances ease of development with performance, the recommended core stack is:
- **Shapely** for geometry
- **NumPy** for numerical operations
- **svgwrite** for output generation
- **Pydantic** for data models
- **SciPy** or **DEAP** for optimization (depending on chosen algorithm)
- **OR-Tools** for constraint programming (optional, for exact solutions)

This stack provides all necessary capabilities while leveraging well-maintained, widely-used libraries.
