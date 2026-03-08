"""
Base class for placement algorithms.

All placement algorithms should inherit from PlacementAlgorithm and implement
the generate_placements method.
"""

from abc import ABC, abstractmethod
from typing import List
import time

from ..models import Piece, Fabric, Placement, Parameters, Point


class PlacementAlgorithm(ABC):
    """Abstract base class for placement algorithms."""
    
    def __init__(self, parameters: Parameters):
        """
        Initialize algorithm with parameters.
        
        Args:
            parameters: Algorithm parameters
        """
        self.parameters = parameters
        self.start_time = None
    
    @abstractmethod
    def generate_placements(
        self, 
        pieces: List[Piece], 
        fabric: Fabric
    ) -> List[Placement]:
        """
        Generate one or more placement propositions.
        
        Args:
            pieces: List of pieces to place
            fabric: Fabric to place pieces on
        
        Returns:
            List of Placement objects, sorted by quality (best first)
        """
        pass
    
    def _start_timer(self):
        """Start timing the algorithm execution."""
        self.start_time = time.time()
    
    def _check_timeout(self) -> bool:
        """
        Check if algorithm has exceeded time limit.
        
        Returns:
            True if timeout exceeded, False otherwise
        """
        if self.start_time is None:
            return False
        
        elapsed = time.time() - self.start_time
        return elapsed >= self.parameters.time_limit
    
    def _preprocess_pieces(self, pieces: List[Piece]) -> List[Piece]:
        """
        Common preprocessing for pieces.
        
        Handles:
        - Multiplicity expansion (creating copies)
        - Piece enlargement factor application
        - Seam allowance inclusion
        
        Args:
            pieces: Original list of pieces
        
        Returns:
            Expanded list of pieces ready for placement
        """
        expanded_pieces = []
        
        for piece in pieces:
            # Handle multiplicity
            # Strategy: create separate instances for each required copy
            for copy_idx in range(piece.multiplicity):
                # Create a copy with unique ID
                piece_copy = Piece(
                    id=f"{piece.id}_copy_{copy_idx}",
                    contour=piece.contour.copy(),
                    sides=piece.sides.copy() if piece.sides else [],
                    grain_direction=piece.grain_direction,
                    multiplicity=1,  # Each copy has multiplicity 1
                    labels=piece.labels.copy(),
                    folding_lines=piece.folding_lines.copy(),
                    seam_allowance=piece.seam_allowance
                )
                
                # Apply enlargement factor if specified
                if self.parameters.piece_enlargement_factor > 1.0:
                    # This would require scaling the contour
                    # For now, we'll just note it in the seam allowance
                    piece_copy.seam_allowance *= self.parameters.piece_enlargement_factor
                
                expanded_pieces.append(piece_copy)
        
        return expanded_pieces
    
    def _sort_pieces_by_size(
        self, 
        pieces: List[Piece],
        sort_by: str = "area"
    ) -> List[Piece]:
        """
        Sort pieces by size (largest first heuristic).
        
        Args:
            pieces: List of pieces to sort
            sort_by: Criterion to sort by ("area", "width", "height", "perimeter")
        
        Returns:
            Sorted list of pieces (largest first)
        """
        if sort_by == "area":
            return sorted(pieces, key=lambda p: p.get_area(), reverse=True)
        elif sort_by == "width":
            return sorted(pieces, key=lambda p: p.get_width(), reverse=True)
        elif sort_by == "height":
            return sorted(pieces, key=lambda p: p.get_height(), reverse=True)
        elif sort_by == "perimeter":
            return sorted(
                pieces, 
                key=lambda p: p.get_width() + p.get_height(), 
                reverse=True
            )
        else:
            raise ValueError(f"Unknown sort criterion: {sort_by}")
    
    def _create_empty_placement(self, fabric: Fabric) -> Placement:
        """
        Create an empty placement object.
        
        Args:
            fabric: Fabric for the placement
        
        Returns:
            Empty Placement object
        """
        return Placement(
            fabric=fabric,
            placed_pieces=[],
            metadata={"algorithm": self.__class__.__name__}
        )
    
    def _finalize_placement(self, placement: Placement) -> Placement:
        """
        Finalize a placement by calculating metrics.
        
        Args:
            placement: Placement to finalize
        
        Returns:
            Finalized placement with calculated metrics
        """
        placement.calculate_length()
        placement.calculate_cost()
        
        # Round fabric length if needed
        if self.parameters.fabric_length_step is not None:
            placement.total_length = self.parameters.round_fabric_length(
                placement.total_length
            )
            placement.total_cost = (
                placement.total_length * placement.fabric.cost_per_unit_length
            )
        
        return placement
    
    def _get_algorithm_name(self) -> str:
        """Get the name of this algorithm."""
        return self.__class__.__name__
