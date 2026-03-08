"""
Main orchestrator for pattern nesting system.

This module coordinates the entire workflow: parsing, algorithm selection,
placement generation, validation, and output.
"""

from typing import List, Optional
from pathlib import Path
from .models import Piece, Fabric, Placement, Parameters
from .constraints import ConstraintChecker
from .algorithms.greedy import GreedyAlgorithm
from .svg_parser import SVGParser
from .svg_renderer import render_placement_svg, render_multiple_placements


class NestingOrchestrator:
    """
    Main orchestrator for the pattern nesting system.
    
    Coordinates:
    - Parameter validation
    - SVG parsing (when implemented)
    - Algorithm selection and execution
    - Placement validation
    - Result ranking and output
    """
    
    def __init__(self, parameters: Optional[Parameters] = None):
        """
        Initialize orchestrator.
        
        Args:
            parameters: Algorithm parameters (uses defaults if None)
        """
        self.parameters = parameters or Parameters()
        self.constraint_checker = ConstraintChecker(self.parameters)
        self.svg_parser = SVGParser()
    
    def solve(
        self, 
        pieces: List[Piece], 
        fabric: Fabric
    ) -> List[Placement]:
        """
        Main entry point: generate optimal placements.
        
        Args:
            pieces: List of pattern pieces to place
            fabric: Fabric specification
        
        Returns:
            List of placement propositions, sorted by quality (best first)
        """
        # Validate inputs
        self._validate_inputs(pieces, fabric)
        
        # Select algorithm
        algorithm = self._select_algorithm()
        
        # Generate placements
        placements = algorithm.generate_placements(pieces, fabric)
        
        # Post-process placements
        placements = self._post_process_placements(placements, pieces)
        
        # Sort by quality
        placements.sort(key=lambda p: (not p.is_valid, p.total_length, p.total_cost))
        
        return placements
    
    def solve_from_svg(
        self,
        svg_files: List[str],
        fabric: Fabric
    ) -> List[Placement]:
        """
        Solve nesting problem from SVG files.
        
        Args:
            svg_files: List of paths to SVG files containing pieces
            fabric: Fabric specification
        
        Returns:
            List of placement propositions
        """
        pieces = []
        
        for svg_file in svg_files:
            try:
                file_pieces = self.svg_parser.parse_svg_file(svg_file)
                pieces.extend(file_pieces)
                print(f"✓ Parsed {len(file_pieces)} pieces from {svg_file}")
            except Exception as e:
                print(f"✗ Error parsing {svg_file}: {e}")
        
        if not pieces:
            raise ValueError("No pieces could be parsed from SVG files")
        
        return self.solve(pieces, fabric)
    
    def save_placements_as_svg(
        self,
        placements: List[Placement],
        output_dir: str,
        base_name: str = "placement"
    ):
        """
        Save placements as SVG files.
        
        Args:
            placements: List of placements to save
            output_dir: Directory to save SVG files
            base_name: Base name for output files
        """
        render_multiple_placements(
            placements,
            output_dir,
            base_name=base_name,
            scale=1.0
        )
        
        print(f"✓ Saved {len(placements)} placement(s) to {output_dir}")
    
    def save_best_placement_as_svg(
        self,
        placement: Placement,
        output_path: str
    ):
        """
        Save best placement as SVG file.
        
        Args:
            placement: Placement to save
            output_path: Path where SVG will be saved
        """
        render_placement_svg(
            placement,
            output_path,
            title="Optimized Pattern Placement",
            scale=1.0
        )
        
        print(f"✓ Saved placement to {output_path}")
    
    def _validate_inputs(self, pieces: List[Piece], fabric: Fabric):
        """
        Validate input pieces and fabric.
        
        Args:
            pieces: List of pieces
            fabric: Fabric specification
        
        Raises:
            ValueError: If inputs are invalid
        """
        if not pieces:
            raise ValueError("No pieces provided")
        
        if fabric.width <= 0:
            raise ValueError("Fabric width must be positive")
        
        # Check each piece is valid
        for piece in pieces:
            if not piece.contour:
                raise ValueError(f"Piece {piece.id} has no contour")
            
            if len(piece.contour) < 3:
                raise ValueError(f"Piece {piece.id} contour must have at least 3 points")
            
            if piece.multiplicity < 1:
                raise ValueError(f"Piece {piece.id} multiplicity must be >= 1")
            
            # Check if piece even fits in fabric
            piece_width = piece.get_width()
            if piece_width > fabric.width:
                raise ValueError(
                    f"Piece {piece.id} width ({piece_width:.2f}cm) "
                    f"exceeds fabric width ({fabric.width:.2f}cm)"
                )
    
    def _select_algorithm(self):
        """
        Select appropriate algorithm based on parameters and problem size.
        
        Returns:
            PlacementAlgorithm instance
        """
        algorithm_name = self.parameters.algorithm.lower()
        
        if algorithm_name == "greedy":
            return GreedyAlgorithm(self.parameters)
        elif algorithm_name == "simulated_annealing":
            # Not yet implemented
            print("Warning: Simulated annealing not yet implemented, using greedy")
            return GreedyAlgorithm(self.parameters)
        elif algorithm_name == "genetic":
            # Not yet implemented
            print("Warning: Genetic algorithm not yet implemented, using greedy")
            return GreedyAlgorithm(self.parameters)
        elif algorithm_name == "constraint_programming":
            # Not yet implemented
            print("Warning: Constraint programming not yet implemented, using greedy")
            return GreedyAlgorithm(self.parameters)
        else:
            print(f"Warning: Unknown algorithm '{algorithm_name}', using greedy")
            return GreedyAlgorithm(self.parameters)
    
    def _post_process_placements(
        self, 
        placements: List[Placement],
        original_pieces: List[Piece]
    ) -> List[Placement]:
        """
        Post-process placements: validate, calculate statistics.
        
        Args:
            placements: List of placements from algorithm
            original_pieces: Original piece list (for multiplicity checking)
        
        Returns:
            Post-processed placements
        """
        processed = []
        
        for placement in placements:
            # Validate placement
            if not placement.is_valid:
                is_valid, errors = self.constraint_checker.check_placement_valid(placement)
                placement.is_valid = is_valid
                placement.validation_errors = errors
            
            # Check multiplicity satisfaction
            mult_ok, mult_errors = self.constraint_checker.check_multiplicity_satisfied(
                placement, original_pieces
            )
            if not mult_ok:
                placement.is_valid = False
                placement.validation_errors.extend(mult_errors)
            
            # Calculate statistics
            stats = self.constraint_checker.get_placement_statistics(placement)
            placement.metadata["statistics"] = stats
            
            processed.append(placement)
        
        return processed
    
    def get_best_placement(
        self, 
        pieces: List[Piece], 
        fabric: Fabric
    ) -> Optional[Placement]:
        """
        Get single best placement (convenience method).
        
        Args:
            pieces: List of pieces to place
            fabric: Fabric specification
        
        Returns:
            Best placement or None if no valid placement found
        """
        placements = self.solve(pieces, fabric)
        
        if not placements:
            return None
        
        # Return first valid placement (they're sorted)
        for placement in placements:
            if placement.is_valid:
                return placement
        
        # If no valid placement, return best invalid one
        return placements[0] if placements else None
    
def create_orchestrator(
    algorithm: str = "greedy",
    num_propositions: int = 5,
    time_limit: float = 60.0,
    **kwargs
) -> NestingOrchestrator:
    """
    Convenience factory function to create an orchestrator.
    
    Args:
        algorithm: Algorithm name
        num_propositions: Number of placements to generate
        time_limit: Time limit in seconds
        **kwargs: Additional parameter overrides
    
    Returns:
        NestingOrchestrator instance
    """
    parameters = Parameters(
        algorithm=algorithm,
        num_propositions=num_propositions,
        time_limit=time_limit,
        **kwargs
    )
    
    return NestingOrchestrator(parameters)


def create_orchestrator(
    algorithm: str = "greedy",
    num_propositions: int = 5,
    time_limit: float = 60.0,
    **kwargs
) -> NestingOrchestrator:
    """
    Convenience factory function to create an orchestrator.
    
    Args:
        algorithm: Algorithm name
        num_propositions: Number of placements to generate
        time_limit: Time limit in seconds
        **kwargs: Additional parameter overrides
    
    Returns:
        NestingOrchestrator instance
    """
    parameters = Parameters(
        algorithm=algorithm,
        num_propositions=num_propositions,
        time_limit=time_limit,
        **kwargs
    )
    
    return NestingOrchestrator(parameters)
