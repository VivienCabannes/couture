"""
Core data models for pattern nesting system.

This module defines the fundamental data structures used throughout the nesting
algorithm, including pieces, fabric, placements, and related entities.
"""

from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict
from enum import Enum
import numpy as np

try:
    from shapely.geometry import Polygon, Point as ShapelyPoint, LineString
    from shapely.affinity import translate as shapely_translate, scale as shapely_scale
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False
    Polygon = None
    ShapelyPoint = None
    LineString = None


@dataclass
class Point:
    """Represents a 2D point."""
    x: float
    y: float
    
    def translate(self, dx: float, dy: float) -> 'Point':
        """Translate point by given offsets."""
        return Point(self.x + dx, self.y + dy)
    
    def reflect_across_line(self, line_start: 'Point', line_end: 'Point') -> 'Point':
        """Reflect point across a line defined by two points."""
        # Vector along the line
        dx = line_end.x - line_start.x
        dy = line_end.y - line_start.y
        
        # Normalize
        length = np.sqrt(dx**2 + dy**2)
        if length == 0:
            return Point(self.x, self.y)
        
        dx /= length
        dy /= length
        
        # Vector from line start to point
        px = self.x - line_start.x
        py = self.y - line_start.y
        
        # Project onto line
        dot = px * dx + py * dy
        proj_x = dot * dx
        proj_y = dot * dy
        
        # Reflect
        reflected_x = line_start.x + 2 * proj_x - px
        reflected_y = line_start.y + 2 * proj_y - py
        
        return Point(reflected_x, reflected_y)
    
    def to_tuple(self) -> Tuple[float, float]:
        """Convert to tuple (x, y)."""
        return (self.x, self.y)
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, Point):
            return False
        return np.isclose(self.x, other.x) and np.isclose(self.y, other.y)
    
    def __hash__(self):
        return hash((round(self.x, 6), round(self.y, 6)))


@dataclass
class Side:
    """Represents one side of a pattern piece."""
    points: List[Point]
    cut_on_fold: bool = False
    fold_order: int = -1  # -1 means not folded, >= 0 defines folding order
    
    def is_straight(self, tolerance: float = 1e-6) -> bool:
        """Check if side is a straight line."""
        if len(self.points) < 2:
            return True
        
        # Check if all points are collinear
        p1 = self.points[0]
        p2 = self.points[-1]
        
        for point in self.points[1:-1]:
            # Calculate distance from point to line
            numerator = abs(
                (p2.y - p1.y) * point.x - 
                (p2.x - p1.x) * point.y + 
                p2.x * p1.y - p2.y * p1.x
            )
            denominator = np.sqrt((p2.y - p1.y)**2 + (p2.x - p1.x)**2)
            
            if denominator > 0:
                distance = numerator / denominator
                if distance > tolerance:
                    return False
        
        return True
    
    def length(self) -> float:
        """Calculate total length of the side."""
        total = 0.0
        for i in range(len(self.points) - 1):
            dx = self.points[i+1].x - self.points[i].x
            dy = self.points[i+1].y - self.points[i].y
            total += np.sqrt(dx**2 + dy**2)
        return total


@dataclass
class FoldingLine:
    """Represents a folding line for pattern pieces."""
    start: Point
    end: Point
    associated_piece_ids: List[str] = field(default_factory=list)
    fold_order: int = 0  # Order in which to fold (for multiple folding lines)
    
    def reflect_point(self, point: Point) -> Point:
        """Reflect a point across this folding line."""
        return point.reflect_across_line(self.start, self.end)
    
    def reflect_polygon(self, polygon: Polygon) -> Polygon:
        """Reflect a Shapely polygon across this folding line."""
        if not SHAPELY_AVAILABLE:
            raise ImportError("Shapely is required for polygon reflection")
        
        # Get all exterior coordinates
        coords = list(polygon.exterior.coords)
        reflected_coords = [
            self.reflect_point(Point(x, y)).to_tuple() 
            for x, y in coords
        ]
        
        return Polygon(reflected_coords)
    
    def length(self) -> float:
        """Calculate length of the folding line."""
        dx = self.end.x - self.start.x
        dy = self.end.y - self.start.y
        return np.sqrt(dx**2 + dy**2)


@dataclass
class Piece:
    """Represents a pattern piece to be placed on fabric."""
    id: str
    contour: List[Point]  # Points defining the piece boundary
    sides: List[Side] = field(default_factory=list)
    grain_direction: Tuple[float, float] = (0, 1)  # Default: vertical (y-axis)
    multiplicity: int = 1  # Number of times this piece needs to be cut
    labels: Dict[str, str] = field(default_factory=dict)
    folding_lines: List[FoldingLine] = field(default_factory=list)
    seam_allowance: float = 0.0  # in cm
    
    def __post_init__(self):
        """Validate piece after initialization."""
        if self.multiplicity < 1:
            raise ValueError(f"Piece {self.id} multiplicity must be >= 1")
        
        if self.seam_allowance < 0:
            raise ValueError(f"Piece {self.id} seam allowance must be >= 0")
        
        # If sides not provided, create a single side from contour
        if not self.sides and self.contour:
            self.sides = [Side(points=self.contour)]
    
    def get_polygon(self, include_seam_allowance: bool = True) -> Polygon:
        """
        Get Shapely polygon representation of the piece.
        
        Args:
            include_seam_allowance: If True, add seam allowance to polygon
        
        Returns:
            Shapely Polygon object
        """
        if not SHAPELY_AVAILABLE:
            raise ImportError("Shapely is required for polygon operations")
        
        coords = [p.to_tuple() for p in self.contour]
        polygon = Polygon(coords)
        
        if include_seam_allowance and self.seam_allowance > 0:
            # Buffer adds seam allowance around the polygon
            polygon = polygon.buffer(self.seam_allowance)
        
        return polygon
    
    def get_bounds(self, include_seam_allowance: bool = True) -> Tuple[float, float, float, float]:
        """
        Get bounding box of the piece.
        
        Returns:
            Tuple of (min_x, min_y, max_x, max_y)
        """
        polygon = self.get_polygon(include_seam_allowance)
        return polygon.bounds
    
    def get_area(self, include_seam_allowance: bool = True) -> float:
        """Calculate area of the piece."""
        polygon = self.get_polygon(include_seam_allowance)
        return polygon.area
    
    def get_width(self, include_seam_allowance: bool = True) -> float:
        """Get width (x-extent) of the piece."""
        min_x, _, max_x, _ = self.get_bounds(include_seam_allowance)
        return max_x - min_x
    
    def get_height(self, include_seam_allowance: bool = True) -> float:
        """Get height (y-extent) of the piece."""
        _, min_y, _, max_y = self.get_bounds(include_seam_allowance)
        return max_y - min_y
    
    def create_folded_representation(self) -> Polygon:
        """
        Create a polygon representation that includes all folded instances.
        
        For pieces with 'cut on fold' sides, this creates a reflection of the
        piece across the folding line, effectively doubling (or more) the size.
        
        Returns:
            Shapely Polygon representing the fully unfolded piece
        """
        if not SHAPELY_AVAILABLE:
            raise ImportError("Shapely is required for folding operations")
        
        base_polygon = self.get_polygon(include_seam_allowance=True)
        
        if not self.folding_lines:
            return base_polygon
        
        # Sort folding lines by fold order
        sorted_folding_lines = sorted(self.folding_lines, key=lambda fl: fl.fold_order)
        
        # Progressively reflect across each folding line
        current_polygon = base_polygon
        for folding_line in sorted_folding_lines:
            reflected = folding_line.reflect_polygon(current_polygon)
            # Union with the reflected version
            current_polygon = current_polygon.union(reflected)
        
        return current_polygon
    
    def has_cut_on_fold_sides(self) -> bool:
        """Check if piece has any 'cut on fold' sides."""
        return any(side.cut_on_fold for side in self.sides)


@dataclass
class Fabric:
    """Represents the fabric on which pieces will be placed."""
    width: float  # Fixed width in cm
    grain_direction: Tuple[float, float] = (0, 1)  # Default: vertical (y-axis)
    has_oriented_pattern: bool = False  # e.g., horizontal stripes
    cost_per_unit_length: float = 1.0  # Cost per cm of length
    
    def __post_init__(self):
        """Validate fabric parameters."""
        if self.width <= 0:
            raise ValueError("Fabric width must be positive")
        if self.cost_per_unit_length < 0:
            raise ValueError("Fabric cost per unit length must be non-negative")
    
    def get_available_width(self) -> float:
        """Get available width for piece placement."""
        return self.width


@dataclass
class PlacedPiece:
    """Represents a piece that has been placed on fabric."""
    piece: Piece  # Reference to original piece
    position: Point  # Translation (bottom-left corner or reference point)
    is_folded: bool = False  # Whether this placement uses folding
    folding_line_index: Optional[int] = None  # Index of folding line used (if any)
    
    def get_transformed_polygon(self) -> Polygon:
        """
        Get the polygon representing this piece in its placed position.
        
        Returns:
            Shapely Polygon in world coordinates
        """
        if not SHAPELY_AVAILABLE:
            raise ImportError("Shapely is required for polygon operations")
        
        # Get base polygon (with seam allowance)
        if self.is_folded:
            polygon = self.piece.create_folded_representation()
        else:
            polygon = self.piece.get_polygon(include_seam_allowance=True)
        
        # Translate to position
        translated = shapely_translate(polygon, xoff=self.position.x, yoff=self.position.y)
        
        return translated
    
    def get_bounds(self) -> Tuple[float, float, float, float]:
        """
        Get bounding box of placed piece.
        
        Returns:
            Tuple of (min_x, min_y, max_x, max_y)
        """
        polygon = self.get_transformed_polygon()
        return polygon.bounds


@dataclass
class Placement:
    """Represents a complete placement solution."""
    fabric: Fabric
    placed_pieces: List[PlacedPiece] = field(default_factory=list)
    total_length: float = 0.0  # Total fabric length used
    total_cost: float = 0.0  # Total cost
    is_valid: bool = False  # Whether placement satisfies all constraints
    validation_errors: List[str] = field(default_factory=list)
    metadata: Dict[str, any] = field(default_factory=dict)  # Algorithm info, etc.
    
    def calculate_length(self) -> float:
        """
        Calculate total fabric length required for this placement.
        
        Returns:
            Maximum y-coordinate of any placed piece
        """
        if not self.placed_pieces:
            return 0.0
        
        max_y = 0.0
        for placed_piece in self.placed_pieces:
            _, _, _, piece_max_y = placed_piece.get_bounds()
            max_y = max(max_y, piece_max_y)
        
        self.total_length = max_y
        return max_y
    
    def calculate_cost(self) -> float:
        """
        Calculate total cost of fabric for this placement.
        
        Returns:
            Cost based on fabric length and cost per unit length
        """
        length = self.calculate_length()
        self.total_cost = length * self.fabric.cost_per_unit_length
        return self.total_cost
    
    def validate(self, constraint_checker=None) -> bool:
        """
        Validate this placement against all constraints.
        
        Args:
            constraint_checker: Optional ConstraintChecker instance
        
        Returns:
            True if valid, False otherwise
        """
        # This will be implemented by the constraint checker
        # For now, assume it needs external validation
        if constraint_checker is not None:
            self.is_valid, self.validation_errors = constraint_checker.check_placement_valid(self)
        return self.is_valid
    
    def get_efficiency(self) -> float:
        """
        Calculate placement efficiency (piece area / fabric area used).
        
        Returns:
            Efficiency ratio between 0 and 1
        """
        if self.total_length == 0:
            return 0.0
        
        total_piece_area = sum(
            placed_piece.piece.get_area(include_seam_allowance=True)
            for placed_piece in self.placed_pieces
        )
        
        fabric_area = self.fabric.width * self.total_length
        
        if fabric_area == 0:
            return 0.0
        
        return total_piece_area / fabric_area


@dataclass
class Parameters:
    """Parameters for the nesting algorithm."""
    
    # User parameters
    fabric_width: float = 150.0  # cm
    fabric_cost_per_unit_length: float = 10.0  # cost per cm
    
    # Advanced user parameters
    num_propositions: int = 5  # Number of placement solutions to generate
    piece_enlargement_factor: float = 1.0  # Factor to enlarge pieces (for cutting inaccuracy)
    piece_spacing_factor: float = 1.0  # Minimum spacing between pieces
    fabric_length_step: Optional[float] = None  # Rounding step for fabric length (None = continuous)
    
    # Internal algorithm parameters
    tolerance: float = 1e-6  # Numerical tolerance for geometry operations
    max_iterations: int = 1000  # Maximum iterations for iterative algorithms
    time_limit: float = 60.0  # Time limit in seconds
    random_seed: Optional[int] = None  # Random seed for reproducibility
    grid_cell_size: float = 1.0  # Grid cell size for discretization (cm)
    
    # Algorithm selection
    algorithm: str = "greedy"  # "greedy", "simulated_annealing", "genetic", "constraint_programming"
    
    def __post_init__(self):
        """Validate parameters."""
        if self.fabric_width <= 0:
            raise ValueError("Fabric width must be positive")
        
        if self.num_propositions < 1:
            raise ValueError("Number of propositions must be at least 1")
        
        if self.piece_enlargement_factor < 1.0:
            raise ValueError("Piece enlargement factor must be >= 1.0")
        
        if self.piece_spacing_factor < 1.0:
            raise ValueError("Piece spacing factor must be >= 1.0")
        
        if self.tolerance <= 0:
            raise ValueError("Tolerance must be positive")
        
        if self.max_iterations < 1:
            raise ValueError("Max iterations must be at least 1")
        
        if self.time_limit <= 0:
            raise ValueError("Time limit must be positive")
        
        if self.grid_cell_size <= 0:
            raise ValueError("Grid cell size must be positive")
    
    def round_fabric_length(self, length: float) -> float:
        """
        Round fabric length according to fabric_length_step parameter.
        
        Args:
            length: Raw fabric length
        
        Returns:
            Rounded fabric length
        """
        if self.fabric_length_step is None:
            return length
        
        # Round up to nearest multiple of step
        return np.ceil(length / self.fabric_length_step) * self.fabric_length_step
