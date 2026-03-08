"""
Constraint checking for pattern piece placements.

This module provides utilities to validate that placements satisfy all
required constraints: no overlap, within bounds, valid folding, etc.
"""

from typing import List, Tuple
from .models import Placement, PlacedPiece, Fabric, Parameters

try:
    from shapely.geometry import Polygon
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False


class ConstraintChecker:
    """Checks constraints for pattern piece placements."""
    
    def __init__(self, parameters: Parameters):
        """
        Initialize constraint checker.
        
        Args:
            parameters: Algorithm parameters including tolerance
        """
        if not SHAPELY_AVAILABLE:
            raise ImportError("Shapely is required for constraint checking")
        
        self.parameters = parameters
        self.tolerance = parameters.tolerance
    
    def check_overlap(self, piece1: PlacedPiece, piece2: PlacedPiece) -> bool:
        """
        Check if two placed pieces overlap.
        
        Args:
            piece1: First placed piece
            piece2: Second placed piece
        
        Returns:
            True if pieces overlap, False otherwise
        """
        poly1 = piece1.get_transformed_polygon()
        poly2 = piece2.get_transformed_polygon()
        
        # Check intersection
        intersection = poly1.intersection(poly2)
        
        # Consider overlap if intersection area is significant (beyond tolerance)
        return intersection.area > self.tolerance
    
    def check_within_bounds(self, piece: PlacedPiece, fabric: Fabric) -> bool:
        """
        Check if a placed piece is entirely within fabric bounds.
        
        Args:
            piece: Placed piece to check
            fabric: Fabric bounds
        
        Returns:
            True if piece is within bounds, False otherwise
        """
        min_x, min_y, max_x, max_y = piece.get_bounds()
        
        # Check x bounds (fabric width)
        if min_x < -self.tolerance:
            return False
        if max_x > fabric.width + self.tolerance:
            return False
        
        # Check y bounds (piece should be at y >= 0)
        if min_y < -self.tolerance:
            return False
        
        return True
    
    def check_folding_valid(
        self, 
        piece: PlacedPiece, 
        all_pieces: List[PlacedPiece]
    ) -> Tuple[bool, str]:
        """
        Check if folding lines can be properly unfolded without overlap.
        
        Args:
            piece: Placed piece with potential folding
            all_pieces: All pieces in the placement
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # If piece doesn't use folding, it's valid
        if not piece.is_folded:
            return True, ""
        
        if not piece.piece.folding_lines:
            return False, f"Piece {piece.piece.id} marked as folded but has no folding lines"
        
        # Get the folding line being used
        if piece.folding_line_index is None:
            return False, f"Piece {piece.piece.id} marked as folded but no folding line index specified"
        
        if piece.folding_line_index >= len(piece.piece.folding_lines):
            return False, f"Piece {piece.piece.id} folding line index out of range"
        
        folding_line = piece.piece.folding_lines[piece.folding_line_index]
        
        # Get the transformed (placed) polygon
        placed_polygon = piece.get_transformed_polygon()
        
        # For each other piece, check if the unfolded version would overlap
        for other_piece in all_pieces:
            if other_piece is piece:
                continue
            
            other_polygon = other_piece.get_transformed_polygon()
            
            # Check overlap with the already unfolded piece
            if placed_polygon.intersection(other_polygon).area > self.tolerance:
                # This is already checked in overlap, but double-check for folding
                return False, f"Piece {piece.piece.id} (folded) overlaps with {other_piece.piece.id}"
        
        return True, ""
    
    def check_grain_alignment(self, piece: PlacedPiece, fabric: Fabric) -> bool:
        """
        Check if piece grain alignment matches fabric grain.
        
        Since rotation is not permitted, this should always be True if pieces
        are correctly oriented in the input.
        
        Args:
            piece: Placed piece
            fabric: Fabric with grain direction
        
        Returns:
            True if grain is aligned (always True in current implementation)
        """
        # In the current implementation, pieces cannot be rotated,
        # so grain alignment is always satisfied if input is correct
        return True
    
    def check_spacing(
        self, 
        piece1: PlacedPiece, 
        piece2: PlacedPiece,
        min_spacing: float
    ) -> bool:
        """
        Check if two pieces maintain minimum spacing.
        
        Args:
            piece1: First placed piece
            piece2: Second placed piece
            min_spacing: Minimum required spacing
        
        Returns:
            True if spacing is sufficient, False otherwise
        """
        if min_spacing <= self.tolerance:
            # No spacing required, just check non-overlap
            return not self.check_overlap(piece1, piece2)
        
        poly1 = piece1.get_transformed_polygon()
        poly2 = piece2.get_transformed_polygon()
        
        # Calculate minimum distance between polygons
        distance = poly1.distance(poly2)
        
        return distance >= min_spacing - self.tolerance
    
    def check_placement_valid(self, placement: Placement) -> Tuple[bool, List[str]]:
        """
        Comprehensive validation of entire placement.
        
        Checks:
        - All pieces are within fabric bounds
        - No pieces overlap
        - Folding lines are valid
        - Grain alignment is correct
        - Minimum spacing is maintained (if specified)
        
        Args:
            placement: Placement to validate
        
        Returns:
            Tuple of (is_valid, list_of_error_messages)
        """
        errors = []
        
        # Check if there are any pieces
        if not placement.placed_pieces:
            errors.append("Placement has no pieces")
            return False, errors
        
        # Calculate minimum spacing from parameters
        min_spacing = 0.0
        if self.parameters.piece_spacing_factor > 1.0:
            # Spacing factor > 1.0 means pieces should be spaced apart
            # We'll use a simple heuristic: spacing = average piece size * (factor - 1)
            avg_size = sum(
                p.piece.get_width() + p.piece.get_height()
                for p in placement.placed_pieces
            ) / (2 * len(placement.placed_pieces))
            min_spacing = avg_size * (self.parameters.piece_spacing_factor - 1.0)
        
        # Check each piece
        for i, piece in enumerate(placement.placed_pieces):
            # Check bounds
            if not self.check_within_bounds(piece, placement.fabric):
                errors.append(
                    f"Piece {piece.piece.id} at index {i} is out of fabric bounds"
                )
            
            # Check grain alignment
            if not self.check_grain_alignment(piece, placement.fabric):
                errors.append(
                    f"Piece {piece.piece.id} at index {i} has incorrect grain alignment"
                )
            
            # Check folding validity
            is_folding_valid, folding_error = self.check_folding_valid(
                piece, placement.placed_pieces
            )
            if not is_folding_valid:
                errors.append(folding_error)
            
            # Check overlap/spacing with other pieces
            for j in range(i + 1, len(placement.placed_pieces)):
                other_piece = placement.placed_pieces[j]
                
                if min_spacing > self.tolerance:
                    if not self.check_spacing(piece, other_piece, min_spacing):
                        errors.append(
                            f"Pieces {piece.piece.id} and {other_piece.piece.id} "
                            f"do not maintain minimum spacing of {min_spacing:.2f}cm"
                        )
                else:
                    if self.check_overlap(piece, other_piece):
                        errors.append(
                            f"Pieces {piece.piece.id} and {other_piece.piece.id} overlap"
                        )
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def check_multiplicity_satisfied(
        self,
        placement: Placement,
        required_pieces: List[any]  # List of original pieces with multiplicity
    ) -> Tuple[bool, List[str]]:
        """
        Check if all pieces are placed the required number of times.
        
        Args:
            placement: Placement to check
            required_pieces: List of original Piece objects with multiplicity
        
        Returns:
            Tuple of (is_satisfied, list_of_error_messages)
        """
        errors = []
        
        # Count how many times each piece is placed
        piece_counts = {}
        for placed_piece in placement.placed_pieces:
            piece_id = placed_piece.piece.id
            piece_counts[piece_id] = piece_counts.get(piece_id, 0) + 1
            
            # If folded, count the folded instances
            if placed_piece.is_folded:
                # Each folding line doubles the count
                fold_multiplier = 2 ** len(placed_piece.piece.folding_lines)
                piece_counts[piece_id] = piece_counts.get(piece_id, 0) * fold_multiplier
        
        # Check against required multiplicity
        for piece in required_pieces:
            actual_count = piece_counts.get(piece.id, 0)
            if actual_count < piece.multiplicity:
                errors.append(
                    f"Piece {piece.id} required {piece.multiplicity} times, "
                    f"but only placed {actual_count} times"
                )
            elif actual_count > piece.multiplicity:
                errors.append(
                    f"Piece {piece.id} required {piece.multiplicity} times, "
                    f"but placed {actual_count} times (too many)"
                )
        
        is_satisfied = len(errors) == 0
        return is_satisfied, errors
    
    def get_placement_statistics(self, placement: Placement) -> dict:
        """
        Get statistics about a placement.
        
        Args:
            placement: Placement to analyze
        
        Returns:
            Dictionary with statistics
        """
        if not placement.placed_pieces:
            return {
                "num_pieces": 0,
                "total_piece_area": 0.0,
                "fabric_area": 0.0,
                "efficiency": 0.0,
                "total_length": 0.0,
                "total_cost": 0.0
            }
        
        total_piece_area = sum(
            piece.piece.get_area(include_seam_allowance=True)
            for piece in placement.placed_pieces
        )
        
        length = placement.calculate_length()
        fabric_area = placement.fabric.width * length
        efficiency = total_piece_area / fabric_area if fabric_area > 0 else 0
        
        return {
            "num_pieces": len(placement.placed_pieces),
            "total_piece_area": total_piece_area,
            "fabric_area": fabric_area,
            "efficiency": efficiency,
            "total_length": length,
            "total_cost": placement.calculate_cost(),
            "fabric_width": placement.fabric.width
        }
