"""
Greedy placement algorithm.

This algorithm places pieces sequentially in the first valid position found,
using a simple bottom-left heuristic.
"""

from typing import List, Optional, Tuple
from ..models import Piece, Fabric, Placement, PlacedPiece, Point
from ..constraints import ConstraintChecker
from .base import PlacementAlgorithm


class GreedyAlgorithm(PlacementAlgorithm):
    """
    Greedy placement algorithm using bottom-left heuristic.
    
    Strategy:
    1. Sort pieces by size (largest first)
    2. For each piece, try positions in a grid
    3. Place piece in first valid position found
    4. Continue until all pieces are placed or no valid positions exist
    """
    
    def __init__(self, parameters):
        """Initialize greedy algorithm."""
        super().__init__(parameters)
        self.constraint_checker = ConstraintChecker(parameters)
    
    def generate_placements(
        self, 
        pieces: List[Piece], 
        fabric: Fabric
    ) -> List[Placement]:
        """
        Generate placements using greedy bottom-left algorithm.
        
        Args:
            pieces: List of pieces to place
            fabric: Fabric to place pieces on
        
        Returns:
            List containing one or more placement propositions
        """
        self._start_timer()
        
        # Preprocess pieces (handle multiplicity)
        expanded_pieces = self._preprocess_pieces(pieces)
        
        # Sort pieces by size (largest first)
        sorted_pieces = self._sort_pieces_by_size(expanded_pieces, sort_by="area")
        
        placements = []
        
        # Generate multiple placements using different strategies
        for sort_criterion in ["area", "width", "height"]:
            if self._check_timeout():
                break
            
            sorted_pieces = self._sort_pieces_by_size(
                expanded_pieces, 
                sort_by=sort_criterion
            )
            
            placement = self._generate_single_placement(sorted_pieces, fabric)
            
            if placement and placement.is_valid:
                placements.append(placement)
            
            # If we have enough placements, stop
            if len(placements) >= self.parameters.num_propositions:
                break
        
        # If we didn't get enough placements, try with different grid resolutions
        while len(placements) < self.parameters.num_propositions and not self._check_timeout():
            # Try with a finer grid
            old_grid_size = self.parameters.grid_cell_size
            self.parameters.grid_cell_size *= 0.5
            
            placement = self._generate_single_placement(sorted_pieces, fabric)
            
            if placement and placement.is_valid:
                placements.append(placement)
            
            self.parameters.grid_cell_size = old_grid_size
            break  # Only try once with finer grid
        
        # Sort placements by fabric usage (best first)
        placements.sort(key=lambda p: p.total_length)
        
        return placements[:self.parameters.num_propositions]
    
    def _generate_single_placement(
        self, 
        pieces: List[Piece], 
        fabric: Fabric
    ) -> Optional[Placement]:
        """
        Generate a single placement using greedy algorithm.
        
        Args:
            pieces: Sorted list of pieces to place
            fabric: Fabric to place pieces on
        
        Returns:
            Placement object or None if placement failed
        """
        placement = self._create_empty_placement(fabric)
        
        for piece in pieces:
            if self._check_timeout():
                break
            
            # Try to find valid position for this piece
            position = self._find_valid_position(piece, placement, fabric)
            
            if position is None:
                # Could not place piece - placement failed
                print(f"Warning: Could not place piece {piece.id}")
                placement.is_valid = False
                placement.validation_errors.append(
                    f"Could not find valid position for piece {piece.id}"
                )
                return placement
            
            # Place the piece
            placed_piece = PlacedPiece(
                piece=piece,
                position=position,
                is_folded=False  # Greedy algorithm doesn't use folding initially
            )
            placement.placed_pieces.append(placed_piece)
        
        # Finalize placement
        placement = self._finalize_placement(placement)
        
        # Validate
        placement.is_valid, placement.validation_errors = (
            self.constraint_checker.check_placement_valid(placement)
        )
        
        return placement
    
    def _find_valid_position(
        self, 
        piece: Piece, 
        partial_placement: Placement,
        fabric: Fabric
    ) -> Optional[Point]:
        """
        Find first valid position for a piece using bottom-left heuristic.
        
        Strategy:
        1. Generate candidate positions on a grid
        2. For each position (bottom-left priority):
           - Check if piece fits within fabric bounds
           - Check if piece overlaps with already placed pieces
           - Return first valid position
        
        Args:
            piece: Piece to place
            partial_placement: Current partial placement
            fabric: Fabric bounds
        
        Returns:
            Valid position (Point) or None if no valid position found
        """
        # Get piece dimensions
        piece_width = piece.get_width()
        piece_height = piece.get_height()
        
        # Check if piece even fits in fabric width
        if piece_width > fabric.width + self.parameters.tolerance:
            return None
        
        # Generate candidate positions on a grid
        # Start from (0, 0) and move right, then up
        grid_step = self.parameters.grid_cell_size
        
        # Calculate search bounds
        max_x = fabric.width - piece_width
        
        # Determine max_y based on current placement
        if partial_placement.placed_pieces:
            current_max_y = max(
                pp.get_bounds()[3]  # max_y of each placed piece
                for pp in partial_placement.placed_pieces
            )
            max_y = current_max_y + piece_height * 2  # Search a bit above current pieces
        else:
            max_y = piece_height * 2  # For first piece
        
        # Try positions in bottom-left order
        # Priority: low y (bottom), then low x (left)
        candidate_positions = []
        
        y = 0
        while y <= max_y:
            x = 0
            while x <= max_x:
                candidate_positions.append(Point(x, y))
                x += grid_step
            
            # Also try at the right edge
            if max_x > 0 and (max_x % grid_step) > self.parameters.tolerance:
                candidate_positions.append(Point(max_x, y))
            
            y += grid_step
        
        # Try each candidate position
        for position in candidate_positions:
            if self._is_valid_position(piece, position, partial_placement, fabric):
                return position
        
        return None
    
    def _is_valid_position(
        self,
        piece: Piece,
        position: Point,
        partial_placement: Placement,
        fabric: Fabric
    ) -> bool:
        """
        Check if placing a piece at a position is valid.
        
        Args:
            piece: Piece to place
            position: Proposed position
            partial_placement: Current partial placement
            fabric: Fabric bounds
        
        Returns:
            True if position is valid, False otherwise
        """
        # Create temporary placed piece
        temp_placed = PlacedPiece(
            piece=piece,
            position=position,
            is_folded=False
        )
        
        # Check bounds
        if not self.constraint_checker.check_within_bounds(temp_placed, fabric):
            return False
        
        # Check overlap with existing pieces
        for existing_placed in partial_placement.placed_pieces:
            if self.constraint_checker.check_overlap(temp_placed, existing_placed):
                return False
        
        return True
    
    def _get_next_candidate_positions(
        self,
        partial_placement: Placement,
        fabric: Fabric,
        grid_step: float
    ) -> List[Point]:
        """
        Get smart candidate positions based on already placed pieces.
        
        This generates positions:
        - At (0, 0) if no pieces placed
        - To the right of existing pieces
        - Above existing pieces
        
        Args:
            partial_placement: Current placement
            fabric: Fabric bounds
            grid_step: Grid resolution
        
        Returns:
            List of candidate positions to try
        """
        if not partial_placement.placed_pieces:
            return [Point(0, 0)]
        
        candidates = []
        
        # Always try origin
        candidates.append(Point(0, 0))
        
        # For each placed piece, generate positions to the right and above
        for placed_piece in partial_placement.placed_pieces:
            min_x, min_y, max_x, max_y = placed_piece.get_bounds()
            
            # To the right
            candidates.append(Point(max_x + grid_step, min_y))
            
            # Above
            candidates.append(Point(min_x, max_y + grid_step))
            
            # Above and to the right
            candidates.append(Point(max_x + grid_step, max_y + grid_step))
        
        # Remove duplicates and sort by (y, x) for bottom-left priority
        unique_candidates = list(set(candidates))
        unique_candidates.sort(key=lambda p: (p.y, p.x))
        
        return unique_candidates
