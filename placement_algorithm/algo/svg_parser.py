"""
SVG Parser for pattern pieces.

This module provides utilities to parse SVG files containing pattern pieces
and extract geometric and metadata information.
"""

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import numpy as np
from .models import Piece, Point, Side, FoldingLine


class SVGPathParser:
    """
    Parser for SVG path data.
    
    Converts SVG path strings (M, L, C, Q, etc.) to lists of points.
    """
    
    def __init__(self, tolerance: float = 0.1):
        """
        Initialize path parser.
        
        Args:
            tolerance: Maximum distance between curve points in discretization
        """
        self.tolerance = tolerance
    
    def parse_path(self, path_data: str) -> List[Point]:
        """
        Parse an SVG path string into a list of points.
        
        Supports:
        - M (moveto)
        - L (lineto)
        - H (horizontal lineto)
        - V (vertical lineto)
        - C (cubic bezier)
        - Q (quadratic bezier)
        - Z (closepath)
        
        Args:
            path_data: SVG path data string (e.g., "M 10 10 L 20 20 Z")
        
        Returns:
            List of Point objects representing the path
        """
        if not path_data:
            return []
        
        points = []
        current_x, current_y = 0, 0
        start_x, start_y = 0, 0
        
        # Parse path data into commands
        commands = self._tokenize_path(path_data)
        i = 0
        
        while i < len(commands):
            cmd = commands[i]
            
            if cmd.upper() == 'M':  # moveto
                is_relative = cmd.islower()
                x, y = float(commands[i+1]), float(commands[i+2])
                
                if is_relative:
                    x += current_x
                    y += current_y
                
                current_x, current_y = x, y
                start_x, start_y = x, y
                points.append(Point(x, y))
                i += 3
                
            elif cmd.upper() == 'L':  # lineto
                is_relative = cmd.islower()
                x, y = float(commands[i+1]), float(commands[i+2])
                
                if is_relative:
                    x += current_x
                    y += current_y
                
                current_x, current_y = x, y
                points.append(Point(x, y))
                i += 3
                
            elif cmd.upper() == 'H':  # horizontal lineto
                is_relative = cmd.islower()
                x = float(commands[i+1])
                
                if is_relative:
                    x += current_x
                
                current_x = x
                points.append(Point(x, current_y))
                i += 2
                
            elif cmd.upper() == 'V':  # vertical lineto
                is_relative = cmd.islower()
                y = float(commands[i+1])
                
                if is_relative:
                    y += current_y
                
                current_y = y
                points.append(Point(current_x, y))
                i += 2
                
            elif cmd.upper() == 'C':  # cubic bezier
                is_relative = cmd.islower()
                x1 = float(commands[i+1])
                y1 = float(commands[i+2])
                x2 = float(commands[i+3])
                y2 = float(commands[i+4])
                x = float(commands[i+5])
                y = float(commands[i+6])
                
                if is_relative:
                    x1 += current_x
                    y1 += current_y
                    x2 += current_x
                    y2 += current_y
                    x += current_x
                    y += current_y
                
                # Discretize cubic bezier
                bezier_points = self._cubic_bezier(
                    current_x, current_y,
                    x1, y1, x2, y2, x, y
                )
                points.extend(bezier_points[1:])  # Skip first point (already added)
                
                current_x, current_y = x, y
                i += 7
                
            elif cmd.upper() == 'Q':  # quadratic bezier
                is_relative = cmd.islower()
                x1 = float(commands[i+1])
                y1 = float(commands[i+2])
                x = float(commands[i+3])
                y = float(commands[i+4])
                
                if is_relative:
                    x1 += current_x
                    y1 += current_y
                    x += current_x
                    y += current_y
                
                # Discretize quadratic bezier
                bezier_points = self._quadratic_bezier(
                    current_x, current_y,
                    x1, y1, x, y
                )
                points.extend(bezier_points[1:])  # Skip first point
                
                current_x, current_y = x, y
                i += 5
                
            elif cmd.upper() == 'Z':  # closepath
                if points and (points[-1].x != start_x or points[-1].y != start_y):
                    points.append(Point(start_x, start_y))
                current_x, current_y = start_x, start_y
                i += 1
                
            else:
                # Skip unknown commands
                i += 1
        
        return points if len(points) >= 2 else []
    
    def _tokenize_path(self, path_data: str) -> List[str]:
        """
        Tokenize SVG path data string.
        
        Args:
            path_data: SVG path string
        
        Returns:
            List of tokens (commands and parameters)
        """
        import re
        # Split on spaces, commas, and commands (M, L, C, etc.)
        tokens = re.findall(r'[MmLlHhVvCcQqZz]|[-+]?[\d.]+', path_data)
        return tokens
    
    def _cubic_bezier(self, x0, y0, x1, y1, x2, y2, x3, y3) -> List[Point]:
        """
        Discretize a cubic bezier curve.
        
        Args:
            x0, y0: Start point
            x1, y1: Control point 1
            x2, y2: Control point 2
            x3, y3: End point
        
        Returns:
            List of points along the curve
        """
        points = [Point(x0, y0)]
        
        # Adaptive subdivision
        def subdivide(x0, y0, x1, y1, x2, y2, x3, y3, depth=0):
            if depth > 16:  # Max recursion depth
                return [Point(x3, y3)]
            
            # Midpoints
            x01 = (x0 + x1) / 2
            y01 = (y0 + y1) / 2
            x12 = (x1 + x2) / 2
            y12 = (y1 + y2) / 2
            x23 = (x2 + x3) / 2
            y23 = (y2 + y3) / 2
            
            x012 = (x01 + x12) / 2
            y012 = (y01 + y12) / 2
            x123 = (x12 + x23) / 2
            y123 = (y12 + y23) / 2
            
            x0123 = (x012 + x123) / 2
            y0123 = (y012 + y123) / 2
            
            # Check if we can approximate with a line
            dx = x3 - x0
            dy = y3 - y0
            distance = np.sqrt(dx*dx + dy*dy)
            
            if distance < self.tolerance:
                return [Point(x3, y3)]
            
            # Recurse
            left = subdivide(x0, y0, x01, y01, x012, y012, x0123, y0123, depth+1)
            right = subdivide(x0123, y0123, x123, y123, x23, y23, x3, y3, depth+1)
            
            return left + right
        
        points.extend(subdivide(x0, y0, x1, y1, x2, y2, x3, y3))
        return points
    
    def _quadratic_bezier(self, x0, y0, x1, y1, x2, y2) -> List[Point]:
        """
        Discretize a quadratic bezier curve.
        
        Args:
            x0, y0: Start point
            x1, y1: Control point
            x2, y2: End point
        
        Returns:
            List of points along the curve
        """
        points = [Point(x0, y0)]
        
        def subdivide(x0, y0, x1, y1, x2, y2, depth=0):
            if depth > 16:  # Max recursion depth
                return [Point(x2, y2)]
            
            # Midpoints
            x01 = (x0 + x1) / 2
            y01 = (y0 + y1) / 2
            x12 = (x1 + x2) / 2
            y12 = (y1 + y2) / 2
            
            x012 = (x01 + x12) / 2
            y012 = (y01 + y12) / 2
            
            # Check if we can approximate with a line
            dx = x2 - x0
            dy = y2 - y0
            distance = np.sqrt(dx*dx + dy*dy)
            
            if distance < self.tolerance:
                return [Point(x2, y2)]
            
            # Recurse
            left = subdivide(x0, y0, x01, y01, x012, y012, depth+1)
            right = subdivide(x012, y012, x12, y12, x2, y2, depth+1)
            
            return left + right
        
        points.extend(subdivide(x0, y0, x1, y1, x2, y2))
        return points


class SVGParser:
    """
    Parser for SVG files containing pattern pieces.
    
    Extracts piece geometry and metadata from SVG files with custom attributes.
    """
    
    # SVG namespace
    SVG_NS = {'svg': 'http://www.w3.org/2000/svg'}
    
    def __init__(self, path_tolerance: float = 0.1):
        """
        Initialize SVG parser.
        
        Args:
            path_tolerance: Tolerance for bezier curve discretization
        """
        self.path_parser = SVGPathParser(tolerance=path_tolerance)
    
    def parse_svg_file(self, filepath: str) -> List[Piece]:
        """
        Parse an SVG file and extract pattern pieces.
        
        Expected SVG structure:
        - Each <path> or <g> element represents a piece
        - Custom attributes define metadata:
          - data-piece-id: unique identifier (required)
          - data-multiplicity: number of copies (default: 1)
          - data-seam-allowance: seam allowance in cm (default: 0)
          - data-grain-direction: angle in degrees (default: 0 = vertical)
          - data-cut-on-fold: comma-separated side indices (optional)
          - data-folding-lines: JSON array of folding lines (optional)
        
        Args:
            filepath: Path to SVG file
        
        Returns:
            List of Piece objects
        """
        path = Path(filepath)
        
        if not path.exists():
            raise FileNotFoundError(f"SVG file not found: {filepath}")
        
        if not path.suffix.lower() == '.svg':
            raise ValueError(f"File is not SVG: {filepath}")
        
        # Parse XML
        tree = ET.parse(filepath)
        root = tree.getroot()
        
        pieces = []
        
        # Find all path and group elements
        for element in root.iter():
            # Check for path elements
            if element.tag.endswith('path'):
                piece = self._parse_path_element(element)
                if piece:
                    pieces.append(piece)
            
            # Check for group elements with data-piece-id
            elif element.tag.endswith('g'):
                # Groups might contain multiple paths (for complex pieces)
                piece = self._parse_group_element(element)
                if piece:
                    pieces.append(piece)
        
        return pieces
    
    def _parse_path_element(self, element) -> Optional[Piece]:
        """
        Parse a single SVG <path> element as a piece.
        
        Args:
            element: XML element
        
        Returns:
            Piece object or None if not a valid piece
        """
        # Check if this element represents a piece
        piece_id = self._get_attribute(element, 'data-piece-id')
        if not piece_id:
            # Try using id or title as fallback
            piece_id = self._get_attribute(element, 'id')
            if not piece_id:
                return None
        
        # Get path data
        path_data = self._get_attribute(element, 'd')
        if not path_data:
            return None
        
        # Parse path to points
        contour = self.path_parser.parse_path(path_data)
        if len(contour) < 3:
            return None
        
        # Extract metadata
        multiplicity = int(self._get_attribute(element, 'data-multiplicity', '1'))
        seam_allowance = float(self._get_attribute(element, 'data-seam-allowance', '0'))
        grain_angle = float(self._get_attribute(element, 'data-grain-direction', '0'))
        grain_direction = self._angle_to_direction(grain_angle)
        
        # Extract labels
        labels = {}
        for attr in element.attrib:
            if attr.startswith('data-label-'):
                label_key = attr[12:]  # Remove 'data-label-' prefix
                labels[label_key] = element.attrib[attr]
        
        # Extract cut-on-fold information
        cut_on_fold_str = self._get_attribute(element, 'data-cut-on-fold', '')
        cut_on_fold_sides = set()
        if cut_on_fold_str:
            cut_on_fold_sides = set(
                int(i.strip()) for i in cut_on_fold_str.split(',') if i.strip().isdigit()
            )
        
        # Create sides with cut-on-fold information
        sides = self._create_sides(contour, cut_on_fold_sides)
        
        # Extract folding lines
        folding_lines = self._parse_folding_lines(element)
        
        # Create and return piece
        return Piece(
            id=piece_id,
            contour=contour,
            sides=sides,
            grain_direction=grain_direction,
            multiplicity=multiplicity,
            labels=labels,
            folding_lines=folding_lines,
            seam_allowance=seam_allowance
        )
    
    def _parse_group_element(self, element) -> Optional[Piece]:
        """
        Parse an SVG <g> (group) element as a piece.
        
        Groups can contain multiple paths that together form a single piece.
        
        Args:
            element: XML element
        
        Returns:
            Piece object or None
        """
        piece_id = self._get_attribute(element, 'data-piece-id')
        if not piece_id:
            return None
        
        # Extract metadata from group
        multiplicity = int(self._get_attribute(element, 'data-multiplicity', '1'))
        seam_allowance = float(self._get_attribute(element, 'data-seam-allowance', '0'))
        grain_angle = float(self._get_attribute(element, 'data-grain-direction', '0'))
        grain_direction = self._angle_to_direction(grain_angle)
        
        labels = {}
        for attr in element.attrib:
            if attr.startswith('data-label-'):
                label_key = attr[12:]
                labels[label_key] = element.attrib[attr]
        
        # Collect all paths in the group
        all_points = []
        for path_elem in element.findall('.//svg:path', self.SVG_NS):
            path_data = self._get_attribute(path_elem, 'd')
            if path_data:
                points = self.path_parser.parse_path(path_data)
                all_points.extend(points)
        
        if len(all_points) < 3:
            return None
        
        # Remove duplicates while preserving order
        contour = []
        seen = set()
        for point in all_points:
            key = (round(point.x, 6), round(point.y, 6))
            if key not in seen:
                contour.append(point)
                seen.add(key)
        
        # Build convex hull if points are too scattered
        if len(contour) > 50:
            contour = self._convex_hull(contour)
        
        cut_on_fold_str = self._get_attribute(element, 'data-cut-on-fold', '')
        cut_on_fold_sides = set()
        if cut_on_fold_str:
            cut_on_fold_sides = set(
                int(i.strip()) for i in cut_on_fold_str.split(',') if i.strip().isdigit()
            )
        
        sides = self._create_sides(contour, cut_on_fold_sides)
        folding_lines = self._parse_folding_lines(element)
        
        return Piece(
            id=piece_id,
            contour=contour,
            sides=sides,
            grain_direction=grain_direction,
            multiplicity=multiplicity,
            labels=labels,
            folding_lines=folding_lines,
            seam_allowance=seam_allowance
        )
    
    def _parse_folding_lines(self, element) -> List[FoldingLine]:
        """
        Extract folding lines from element attributes.
        
        Expected format (JSON array):
        data-folding-lines='[{"x1": 0, "y1": 0, "x2": 10, "y2": 10, "order": 0}]'
        
        Args:
            element: XML element
        
        Returns:
            List of FoldingLine objects
        """
        folding_str = self._get_attribute(element, 'data-folding-lines', '')
        if not folding_str:
            return []
        
        try:
            import json
            folding_data = json.loads(folding_str)
            
            folding_lines = []
            for line_data in folding_data:
                folding_line = FoldingLine(
                    start=Point(line_data['x1'], line_data['y1']),
                    end=Point(line_data['x2'], line_data['y2']),
                    fold_order=line_data.get('order', 0)
                )
                folding_lines.append(folding_line)
            
            return folding_lines
        
        except (json.JSONDecodeError, KeyError, ValueError):
            return []
    
    def _create_sides(
        self, 
        contour: List[Point], 
        cut_on_fold_sides: set
    ) -> List[Side]:
        """
        Create Side objects from contour points.
        
        Args:
            contour: List of Points defining piece contour
            cut_on_fold_sides: Set of side indices that have 'cut on fold'
        
        Returns:
            List of Side objects
        """
        sides = []
        
        # Each consecutive pair of points forms a side
        for i in range(len(contour)):
            next_i = (i + 1) % len(contour)
            
            # Segment from point i to point next_i
            side_points = [contour[i], contour[next_i]]
            
            cut_on_fold = i in cut_on_fold_sides
            
            side = Side(
                points=side_points,
                cut_on_fold=cut_on_fold,
                fold_order=i if cut_on_fold else -1
            )
            sides.append(side)
        
        return sides
    
    def _angle_to_direction(self, angle_degrees: float) -> Tuple[float, float]:
        """
        Convert angle in degrees to direction vector.
        
        Args:
            angle_degrees: Angle in degrees (0 = vertical/up)
        
        Returns:
            Tuple of (dx, dy) normalized direction vector
        """
        # Convert to radians (0 degrees = straight up = (0, 1))
        angle_rad = np.radians(angle_degrees)
        
        # Rotate from (0, 1) by angle_degrees
        dx = np.sin(angle_rad)
        dy = np.cos(angle_rad)
        
        # Normalize
        length = np.sqrt(dx**2 + dy**2)
        if length > 0:
            dx /= length
            dy /= length
        else:
            dx, dy = 0, 1
        
        return (float(dx), float(dy))
    
    def _convex_hull(self, points: List[Point]) -> List[Point]:
        """
        Compute convex hull of points using Graham scan.
        
        Args:
            points: List of points
        
        Returns:
            Points forming convex hull in counterclockwise order
        """
        if len(points) <= 3:
            return points
        
        # Convert to numpy array for easier computation
        pts = np.array([(p.x, p.y) for p in points])
        
        # Find point with lowest y (and leftmost if tie)
        start_idx = np.lexsort((pts[:, 0], pts[:, 1]))[0]
        start = pts[start_idx]
        
        # Sort by polar angle
        angles = np.arctan2(pts[:, 1] - start[1], pts[:, 0] - start[0])
        sorted_indices = np.argsort(angles)
        
        # Graham scan
        hull_indices = []
        for idx in sorted_indices:
            while len(hull_indices) > 1:
                p1 = pts[hull_indices[-2]]
                p2 = pts[hull_indices[-1]]
                p3 = pts[idx]
                
                # Cross product
                cross = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0])
                
                if cross <= 0:
                    break
                
                hull_indices.pop()
            
            hull_indices.append(idx)
        
        # Convert back to Point objects
        return [Point(pts[i][0], pts[i][1]) for i in hull_indices]
    
    def _get_attribute(self, element, attr_name: str, default: str = '') -> str:
        """
        Get attribute value from element, handling namespaces.
        
        Args:
            element: XML element
            attr_name: Attribute name
            default: Default value if attribute not found
        
        Returns:
            Attribute value or default
        """
        # Try with namespace
        namespaced_attr = f'{{{self.SVG_NS["svg"]}}}{attr_name}'
        if namespaced_attr in element.attrib:
            return element.attrib[namespaced_attr]
        
        # Try without namespace
        if attr_name in element.attrib:
            return element.attrib[attr_name]
        
        return default
