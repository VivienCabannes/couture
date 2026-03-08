*This document is a summary of the discussion on placing pattern pieces on fabric for cutting. It describes the received objects, associated properties, and goals to achieve.*

# Received Objects and Properties

1. Pattern (collection of pieces to be cut)
2. Fabric (material on which pieces will be cut)

## Fabric has properties:

- fixed width (x axis)
- grain direction (assumed to be aligned with y axis)
- oriented pattern (e.g. horizontal stripes)
- cost per unit length

## Pattern has properties:

- List of SVG files, each representing a piece to be cut
- Seam allowance (positive number, e.g. 1 cm) to be added around each piece for sewing purposes

## Each piece has properties:

- countour (sides, represented by a sequence of lines/bezier curves)
- grain direction (conventionally aligned with y axis)
- multiplicity (number of times the piece needs to be cut)
- labels (e.g. piece name, size, etc.) for identification and organization purposes
- folding lines (if any) - lines along which the piece can be folded.

## Each side of a piece has properties:

- cut on fold (boolean) (a side with this property must be a straight line)
- fold order (positive integer, if multiple sides have the "cut on fold" property, this defines the order in which they should be folded/unfolded, otherwise it can be set to -1 and ignored)
- folding line (if the side has the "cut on fold" property, there MUST be a folding line coinciding with this side, and the folding line must be associated with the piece)

# Objects to produce after processing:

1. Propositions for placement of pieces on the fabric (pseudo)optimal (represented visually as an SVG file)
- Multiple propositions may be produced, each with a different placement of pieces on the fabric. Only the best one (with the least fabric used) will be selected for showing, but others may be useful for comparison or as alternatives. User can also request to see all propositions (list scrolling) for comparison.
2. (internally) breaking down of unused fabric into smaller rectangles for potential reuse in future placements (NOT IMPLEMENTED IN THE FIRST VERSION, but can be useful for optimization and waste reduction)

## Placement has properties:

For each proposition, the following properties should be provided:
- Total length of fabric used (the maximum y coordinate of any piece placed on the fabric)
- Total cost (length of fabric used multiplied by the cost per unit length)
- Visual representation (SVG file) showing the pieces placed on the fabric, with clear boundaries and labels for each piece
- Folding lines (if any).
- Multiplicity of pieces 

### Folding lines definition:

A folding line is a line segment placed on the fabric. It is associated with a piece.
If the piece associated with the folding line is placed such that it can be unfolded (reflected along the folding line) in the order defined by the "fold order" property without overlapping with any other piece, then the folding line is considered valid. Otherwise, it is considered invalid and the placement of the piece must be adjusted to ensure that the folding line is valid.
A folding line can be associated with muliple pieces. In this case, the folding line is considered valid if all associated pieces can be unfolded all at once without overlapping with any other piece. 

## Placement must respect the following constraints:

- pieces must not overlap
- pieces must be entirely contained within the fabric width (largest x coordinate of them all must be less than or equal to the fabric width)
- Unfolding must be possible
- Folding lines [definition](###folding-lines-definition) must be respected
- NO ROTATION OF PIECES IS PERMITTED (they must be placed in their original orientation, assumed to be aligned with the grain)

# Problem parameters

## User parameters:

- Fabric width (positive number, e.g. 150 cm)
- Fabric cost per unit length (positive number, e.g. 10 currency units per meter)

## Advanced user parameters:

- Number of propositions to generate (positive integer, e.g. 5)
- Piece enlargement factor (if needed): a positive number (e.g. 1.05) to account for cutting inaccuracies
- Piece spacing factor (if needed): a positive number (e.g. 1.1) to ensure enough space between pieces for cutting
- Fabric length step: either continuous (default) or a positive number that defines the step size for fabric length (e.g. 50 cm). Fabric length can not be less than the maximum y coordinate of any piece placed on the fabric, but must be rounded up to the nearest multiple of the fabric length step for practical purposes (e.g. cutting in whole meters).

## Internal parameters:

- Tolerance for numerical precision issues (e.g. when checking if pieces overlap or if they are within the fabric width) - a small positive number (e.g. 1e-6)
- Maximum number of iterations for optimization algorithms (if needed) - a positive integer (e.g. 1000)
- Time limit for optimization algorithms (if needed) - a positive number in seconds (e.g. 60)
- Heuristic parameters for optimization algorithms (if needed) - e.g. cooling schedule for simulated annealing, population size for genetic algorithms, etc.
- Random seed for reproducibility (if needed) - a positive integer (e.g. 42)
- Discretization parameters for representing pieces and fabric as grids (if needed) - e.g. grid cell size in cm (e.g. 1 cm)

# Algorithmic insights and approaches

N-omino insights: pieces can be represented as sets of occupied grid cells (after discretization), and the problem can be approached as a packing problem, similar to Tetris or bin packing. However, the additional constraints (no rotation, folding lines, etc.) make it more complex than standard packing problems.

Larger pieces should be placed first to reduce fragmentation and make it easier to fit smaller pieces around them. This is a common heuristic in packing problems, as it can help to create a more compact arrangement and reduce wasted space.

Instead of needing to consider folding lines, the algorithm can internally represent pieces with their "cut on fold" sides already reflected, effectively treating them as larger pieces.
This simplifies the problem by eliminating the need to explicitly handle folding lines during the placement process.
The algorithm can ensure that the placement of these "folded" pieces allows for unfolding without overlap, thus satisfying the constraints related to folding without needing to manage folding lines separately.

Pieces with multiplicity equal to 2n can be treated as pieces with n or less folding lines, as they can be folded to create multiple copies. For example, a piece with multiplicity 4 can be treated as a piece with 2 folding lines, which can be folded to create 4 copies. This allows the algorithm to handle pieces with higher multiplicity without needing to explicitly manage multiple copies of the same piece, thus simplifying the placement process.
However, it can also be beneficial to treat pieces with multiplicity greater than or equal to 2 as multiple separate pieces, as this can provide more flexibility in placement and potentially lead to better solutions. For example, a piece with multiplicity 4 could be treated as 4 separate pieces, which can be placed independently of each other, rather than being constrained by folding lines. This approach may require more complex handling of the pieces, but it can also allow for more efficient use of the fabric and better overall placements.
A piece with multiplicity 2n + 1 can be treated as a piece with n folding lines and one separate piece, following the same considerations as above. 
A piece with multiplicity 1 can be treated as a piece with no folding lines, as it does not need to be folded to create multiple copies. This simplifies the placement process for pieces with multiplicity 1, as they can be treated as standard pieces without the need for special handling related to folding lines.

## Heuristic approaches: 

Due to the complexity of the problem, heuristic algorithms such as simulated annealing, genetic algorithms, or greedy algorithms may be more practical than exact optimization methods. These algorithms can explore the solution space and find good placements without guaranteeing optimality.
- Simulated annealing: start with an initial placement (e.g. random or based on a simple heuristic), and iteratively make small changes to the placement (e.g. moving a piece, swapping two pieces, etc.) while accepting changes that improve the solution and occasionally accepting worse solutions to escape local minima. The acceptance probability can be controlled by a cooling schedule.
- Genetic algorithms: maintain a population of placements, and iteratively select the best placements, apply crossover (combining parts of two placements) and mutation (randomly changing a placement) to create new placements. The best placements are selected for the next generation, and the process continues until a stopping criterion is met (e.g. number of generations, time limit, etc.).
- Greedy algorithms: start with an empty fabric and iteratively place pieces in the first available position that does not violate the constraints. This approach may not yield the best solution, but it can be fast and simple to implement.

## Exact optimization methods

If the problem size is small enough, exact methods such as integer linear programming (ILP) or constraint programming (CP) can be used to find the optimal solution. However, these methods may not be practical for larger problem sizes due to the combinatorial nature of the problem.

# Additional considerations

- The algorithm should be efficient enough to handle a small number of pieces (e.g. up to 10) and fabric widths (e.g. up to 300 cm) within a reasonable time frame (e.g. under 30 seconds).
- The algorithm should be robust to different shapes and sizes of pieces, as well as different fabric widths and costs.
- The algorithm should be able to generate multiple propositions for placement, allowing the user to compare and select the best one based on fabric usage and cost.
