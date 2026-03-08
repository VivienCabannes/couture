"""
SVG Renderer for placement visualizations.

This module provides utilities to generate SVG files showing piece placements
with visual styling, labels, and metadata.
"""

from typing import List, Dict, Optional, Tuple
from pathlib import Path
from ..models import Piece, Placement, PlacedPiece, FoldingLine, Point
import math


class SVGRenderer:
    """
    Generates SVG visualizations of pattern piece placements.
    """
    
    def __init__(
        self,
        scale: float = 1.0,
        stroke_width: float = 0.5,
        include_grid: bool = False,
        grid_step: float = 10.0
    ):
        """
        Initialize SVG renderer.
        
        Args:
            scale: Scale factor for output (useful for zooming)
            stroke_width: Default stroke width for lines
            include_grid: Whether to include background grid
            grid_step: Grid cell size in cm
        """
        self.scale = scale
        self.stroke_width = stroke_width
        self.include_grid = include_grid
        self.grid_step = grid_step
        
        # Color schemes
        self.colors = {
            'fabric': '#E8E8E8',
            'piece_fill': '#F5E6D3',
            'piece_stroke': '#333333',
            'seam_allowance': '#FFD700',
            'folding_line': '#FF6B6B',
            'grid': '#CCCCCC',
            'label': '#000000',
            'legend_bg': '#FFFFFF'
        }
    
    def render_placement(
        self, 
        placement: Placement, 
        output_path: str,
        title: str = "Pattern Placement",
        include_legend: bool = True,
        include_metadata: bool = True
    ):
        """
        Render a placement to an SVG file.
        
        Args:
            placement: Placement to render
            output_path: Path where SVG will be saved
            title: Title for the SVG document
            include_legend: Whether to include legend
            include_metadata: Whether to include metadata panel
        """
        # Calculate dimensions
        fabric_width = placement.fabric.width
        fabric_height = placement.total_length
        
        # Add margins
        margin = 20
        legend_width = 200 if include_legend else 0
        metadata_height = 80 if include_metadata else 0
        
        svg_width = (fabric_width + 2 * margin + legend_width) * self.scale
        svg_height = (fabric_height + 2 * margin + metadata_height) * self.scale
        
        # Create SVG content
        svg_lines = []
        
        # SVG header
        svg_lines.append(f'<?xml version="1.0" encoding="UTF-8"?>')
        svg_lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" '
                        f'width="{svg_width:.1f}" height="{svg_height:.1f}" '
                        f'viewBox="0 0 {svg_width:.1f} {svg_height:.1f}">')
        
        # Title
        svg_lines.append(f'<title>{title}</title>')
        
        # Define styles
        svg_lines.append(self._create_style_definitions())
        
        # Metadata panel
        if include_metadata:
            svg_lines.append(self._render_metadata_panel(placement, margin, fabric_height))
        
        # Grid (if enabled)
        if self.include_grid:
            svg_lines.append(self._render_grid(
                fabric_width, 
                fabric_height, 
                margin
            ))
        
        # Fabric boundary
        svg_lines.append(self._render_fabric(
            fabric_width, 
            fabric_height, 
            margin
        ))
        
        # Placed pieces
        for placed_piece in placement.placed_pieces:
            svg_lines.append(self._render_placed_piece(
                placed_piece, 
                margin
            ))
        
        # Legend
        if include_legend:
            svg_lines.append(self._render_legend(
                placement,
                margin + fabric_width + 20,
                margin
            ))
        
        # SVG footer
        svg_lines.append('</svg>')
        
        # Write to file
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w') as f:
            f.write('\n'.join(svg_lines))
    
    def _create_style_definitions(self) -> str:
        """Create CSS style definitions for SVG."""
        styles = f'''<defs>
    <style type="text/css">
        .piece-outline {{
            fill: {self.colors['piece_fill']};
            stroke: {self.colors['piece_stroke']};
            stroke-width: {self.stroke_width};
        }}
        .piece-label {{
            font-family: Arial, sans-serif;
            font-size: 10px;
            fill: {self.colors['label']};
            text-anchor: middle;
        }}
        .piece-label-small {{
            font-family: Arial, sans-serif;
            font-size: 8px;
            fill: {self.colors['label']};
            opacity: 0.7;
        }}
        .folding-line {{
            stroke: {self.colors['folding_line']};
            stroke-width: {self.stroke_width * 1.5};
            stroke-dasharray: 3,2;
        }}
        .fabric-boundary {{
            fill: none;
            stroke: {self.colors['piece_stroke']};
            stroke-width: {self.stroke_width * 2};
        }}
        .grid-line {{
            stroke: {self.colors['grid']};
            stroke-width: {self.stroke_width * 0.5};
            opacity: 0.5;
        }}
        .legend-text {{
            font-family: Arial, sans-serif;
            font-size: 11px;
            fill: {self.colors['label']};
        }}
        .metadata-text {{
            font-family: Arial, sans-serif;
            font-size: 10px;
            fill: {self.colors['label']};
        }}
    </style>
</defs>'''
        return styles
    
    def _render_fabric(self, width: float, height: float, margin: float) -> str:
        """Render fabric boundary rectangle."""
        x = margin * self.scale
        y = margin * self.scale
        w = width * self.scale
        h = height * self.scale
        
        return (f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" '
                f'fill="{self.colors["fabric"]}" class="fabric-boundary"/>')
    
    def _render_grid(self, width: float, height: float, margin: float) -> str:
        """Render optional background grid."""
        lines = []
        margin_px = margin * self.scale
        
        # Vertical lines
        x = 0
        while x <= width:
            x_px = (margin + x) * self.scale
            lines.append(
                f'<line x1="{x_px:.2f}" y1="{margin_px:.2f}" '
                f'x2="{x_px:.2f}" y2="{(margin + height) * self.scale:.2f}" '
                f'class="grid-line"/>'
            )
            x += self.grid_step
        
        # Horizontal lines
        y = 0
        while y <= height:
            y_px = (margin + y) * self.scale
            lines.append(
                f'<line x1="{margin_px:.2f}" y1="{y_px:.2f}" '
                f'x2="{(margin + width) * self.scale:.2f}" y2="{y_px:.2f}" '
                f'class="grid-line"/>'
            )
            y += self.grid_step
        
        return '\n    '.join(lines)
    
    def _render_placed_piece(self, placed_piece: PlacedPiece, margin: float) -> str:
        """
        Render a single placed piece.
        
        Args:
            placed_piece: The placed piece to render
            margin: Margin around the fabric
        
        Returns:
            SVG group element containing piece visualization
        """
        lines = []
        
        # Get piece outline
        polygon = placed_piece.get_transformed_polygon()
        coords = list(polygon.exterior.coords)
        
        # Create path data
        if coords:
            path_data = f'M {coords[0][0]:.2f},{coords[0][1]:.2f} '
            for x, y in coords[1:]:
                path_data += f'L {x:.2f},{y:.2f} Z'
            
            # Scale and translate
            x_offset = (margin) * self.scale
            y_offset = (margin) * self.scale
            
            lines.append(f'<g transform="translate({x_offset:.2f}, {y_offset:.2f}) scale({self.scale})">')
            lines.append(f'<path d="{path_data}" class="piece-outline"/>')
            
            # Add label at centroid
            centroid_x = polygon.centroid.x
            centroid_y = polygon.centroid.y
            
            # Piece ID
            lines.append(
                f'<text x="{centroid_x:.2f}" y="{centroid_y:.2f}" '
                f'class="piece-label">{placed_piece.piece.id}</text>'
            )
            
            # Additional labels if available
            for label_key, label_value in placed_piece.piece.labels.items():
                if label_key != 'name':
                    lines.append(
                        f'<text x="{centroid_x:.2f}" y="{centroid_y + 8:.2f}" '
                        f'class="piece-label-small">{label_value}</text>'
                    )
            
            # Folding lines
            if placed_piece.is_folded and placed_piece.piece.folding_lines:
                fold_line = placed_piece.piece.folding_lines[
                    placed_piece.folding_line_index or 0
                ]
                lines.append(
                    f'<line x1="{fold_line.start.x:.2f}" y1="{fold_line.start.y:.2f}" '
                    f'x2="{fold_line.end.x:.2f}" y2="{fold_line.end.y:.2f}" '
                    f'class="folding-line"/>'
                )
            
            lines.append('</g>')
        
        return '\n    '.join(lines)
    
    def _render_legend(
        self, 
        placement: Placement,
        x_offset: float,
        y_offset: float
    ) -> str:
        """
        Render legend showing piece information.
        
        Args:
            placement: Placement to document
            x_offset: X position for legend
            y_offset: Y position for legend
        
        Returns:
            SVG group element containing legend
        """
        lines = []
        lines.append(f'<g id="legend">')
        
        # Legend background
        legend_height = 20 + len(placement.placed_pieces) * 15
        lines.append(
            f'<rect x="{x_offset:.2f}" y="{y_offset:.2f}" '
            f'width="180" height="{legend_height:.2f}" '
            f'fill="{self.colors["legend_bg"]}" '
            f'stroke="{self.colors["piece_stroke"]}" stroke-width="1"/>'
        )
        
        # Title
        lines.append(
            f'<text x="{x_offset + 90:.2f}" y="{y_offset + 15:.2f}" '
            f'class="legend-text" font-weight="bold" text-anchor="middle">Legend</text>'
        )
        
        # Piece list
        current_y = y_offset + 30
        for placed_piece in placement.placed_pieces:
            piece_name = placed_piece.piece.labels.get('name', placed_piece.piece.id)
            qty = placed_piece.piece.multiplicity
            
            # Color dot
            lines.append(
                f'<circle cx="{x_offset + 10:.2f}" cy="{current_y + 3:.2f}" r="3" '
                f'fill="{self.colors["piece_fill"]}" '
                f'stroke="{self.colors["piece_stroke"]}" stroke-width="0.5"/>'
            )
            
            # Text
            lines.append(
                f'<text x="{x_offset + 20:.2f}" y="{current_y + 6:.2f}" '
                f'class="legend-text">{piece_name} (×{qty})</text>'
            )
            
            current_y += 15
        
        lines.append('</g>')
        
        return '\n    '.join(lines)
    
    def _render_metadata_panel(
        self,
        placement: Placement,
        margin: float,
        fabric_height: float
    ) -> str:
        """
        Render metadata panel with placement information.
        
        Args:
            placement: Placement to document
            margin: Margin size
            fabric_height: Height of fabric area
        
        Returns:
            SVG group element containing metadata
        """
        lines = []
        
        # Panel position (below fabric)
        x = margin * self.scale
        y = (margin + fabric_height + 10) * self.scale
        
        lines.append(f'<g id="metadata">')
        
        # Background
        lines.append(
            f'<rect x="{x:.2f}" y="{y:.2f}" width="500" height="70" '
            f'fill="{self.colors["legend_bg"]}" '
            f'stroke="{self.colors["piece_stroke"]}" stroke-width="1"/>'
        )
        
        # Information text
        efficiency = placement.get_efficiency()
        
        texts = [
            f"Fabric: {placement.fabric.width:.1f}cm × {placement.total_length:.1f}cm",
            f"Cost: ${placement.total_cost:.2f} | Efficiency: {efficiency:.1%}",
            f"Pieces placed: {len(placement.placed_pieces)} | Valid: {'✓' if placement.is_valid else '✗'}"
        ]
        
        text_y = y + 20
        for text in texts:
            lines.append(
                f'<text x="{x + 10:.2f}" y="{text_y:.2f}" '
                f'class="metadata-text">{text}</text>'
            )
            text_y += 20
        
        lines.append('</g>')
        
        return '\n    '.join(lines)


def render_placement_svg(
    placement: Placement,
    output_path: str,
    title: str = "Pattern Placement",
    **renderer_kwargs
):
    """
    Convenience function to render a placement.
    
    Args:
        placement: Placement to render
        output_path: Where to save SVG
        title: Title for the SVG
        **renderer_kwargs: Additional arguments for SVGRenderer
    """
    renderer = SVGRenderer(**renderer_kwargs)
    renderer.render_placement(placement, output_path, title=title)


def render_multiple_placements(
    placements: List[Placement],
    output_dir: str,
    base_name: str = "placement",
    **renderer_kwargs
):
    """
    Render multiple placements to separate SVG files.
    
    Args:
        placements: List of placements to render
        output_dir: Directory to save SVG files
        base_name: Base name for output files
        **renderer_kwargs: Additional arguments for SVGRenderer
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    for i, placement in enumerate(placements, 1):
        filename = output_path / f"{base_name}_{i}.svg"
        renderer = SVGRenderer(**renderer_kwargs)
        
        title = f"{base_name.title()} {i}"
        if placement.is_valid:
            title += f" (Valid, {placement.get_efficiency():.1%} efficient)"
        else:
            title += " (Invalid)"
        
        renderer.render_placement(placement, str(filename), title=title)
