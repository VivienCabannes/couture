"""
Tests for SVG parser and renderer.

Tests SVG parsing and rendering functionality following CLAUDE.md guidelines.
"""

import pytest
import tempfile
from pathlib import Path
from algo.svg_parser import SVGParser, SVGPathParser
from algo.svg_renderer import SVGRenderer, render_placement_svg
from algo.models import Piece, Point, Fabric, Placement, PlacedPiece
from algo.orchestrator import create_orchestrator


class TestSVGPathParser:
    """Tests for SVG path parsing."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.parser = SVGPathParser(tolerance=0.1)
    
    def test_parse_empty_path(self):
        """Test parsing empty path."""
        points = self.parser.parse_path("")
        assert points == []
    
    def test_parse_simple_line(self):
        """Test parsing simple line path."""
        # M 0 0 L 10 0 L 10 10 Z
        points = self.parser.parse_path("M 0 0 L 10 0 L 10 10 Z")
        assert len(points) >= 3
        assert points[0].x == 0 and points[0].y == 0
    
    def test_parse_rectangle(self):
        """Test parsing rectangular path."""
        path = "M 0 0 L 10 0 L 10 10 L 0 10 Z"
        points = self.parser.parse_path(path)
        assert len(points) >= 4
        
        # Check corners approximately match
        xs = [p.x for p in points]
        ys = [p.y for p in points]
        
        assert min(xs) == pytest.approx(0, abs=0.5)
        assert max(xs) == pytest.approx(10, abs=0.5)
        assert min(ys) == pytest.approx(0, abs=0.5)
        assert max(ys) == pytest.approx(10, abs=0.5)
    
    def test_parse_relative_commands(self):
        """Test parsing relative move/line commands."""
        # m 0 0 l 10 0 l 0 10 z (relative)
        points = self.parser.parse_path("m 0 0 l 10 0 l 0 10 z")
        assert len(points) >= 3
    
    def test_parse_horizontal_vertical(self):
        """Test parsing horizontal and vertical lines."""
        path = "M 0 0 H 10 V 10 H 0 Z"
        points = self.parser.parse_path(path)
        assert len(points) >= 4


class TestSVGParser:
    """Tests for SVG file parsing."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.parser = SVGParser()
    
    def test_parse_simple_svg(self, tmp_path):
        """Test parsing a simple SVG file with one piece."""
        svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <path d="M 10 10 L 50 10 L 50 50 L 10 50 Z" 
          data-piece-id="piece1" 
          data-multiplicity="1" 
          data-seam-allowance="1.0"/>
</svg>'''
        
        svg_file = tmp_path / "test.svg"
        svg_file.write_text(svg_content)
        
        pieces = self.parser.parse_svg_file(str(svg_file))
        
        assert len(pieces) == 1
        assert pieces[0].id == "piece1"
        assert pieces[0].multiplicity == 1
        assert pieces[0].seam_allowance == 1.0
    
    def test_parse_multiple_pieces(self, tmp_path):
        """Test parsing SVG with multiple pieces."""
        svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <path d="M 10 10 L 50 10 L 50 50 L 10 50 Z" 
          data-piece-id="piece1" 
          data-multiplicity="2"/>
    <path d="M 60 10 L 100 10 L 100 50 L 60 50 Z" 
          data-piece-id="piece2" 
          data-multiplicity="1"/>
</svg>'''
        
        svg_file = tmp_path / "test.svg"
        svg_file.write_text(svg_content)
        
        pieces = self.parser.parse_svg_file(str(svg_file))
        
        assert len(pieces) == 2
        assert pieces[0].id == "piece1"
        assert pieces[1].id == "piece2"
    
    def test_parse_grain_direction(self, tmp_path):
        """Test parsing grain direction."""
        svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <path d="M 10 10 L 50 10 L 50 50 L 10 50 Z" 
          data-piece-id="piece1" 
          data-grain-direction="45"/>
</svg>'''
        
        svg_file = tmp_path / "test.svg"
        svg_file.write_text(svg_content)
        
        pieces = self.parser.parse_svg_file(str(svg_file))
        
        assert len(pieces) == 1
        assert pieces[0].grain_direction is not None
    
    def test_parse_labels(self, tmp_path):
        """Test parsing label attributes."""
        svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <path d="M 10 10 L 50 10 L 50 50 L 10 50 Z" 
          data-piece-id="piece1" 
          data-label-name="Front Panel" 
          data-label-size="Large"/>
</svg>'''
        
        svg_file = tmp_path / "test.svg"
        svg_file.write_text(svg_content)
        
        pieces = self.parser.parse_svg_file(str(svg_file))
        
        assert len(pieces) == 1
        assert "name" in pieces[0].labels
        assert pieces[0].labels["name"] == "Front Panel"
    
    def test_parse_nonexistent_file(self):
        """Test parsing nonexistent file raises error."""
        with pytest.raises(FileNotFoundError):
            self.parser.parse_svg_file("/nonexistent/path.svg")
    
    def test_parse_non_svg_file(self, tmp_path):
        """Test parsing non-SVG file raises error."""
        txt_file = tmp_path / "test.txt"
        txt_file.write_text("Not SVG")
        
        with pytest.raises(ValueError):
            self.parser.parse_svg_file(str(txt_file))


class TestSVGRenderer:
    """Tests for SVG rendering."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.renderer = SVGRenderer(scale=1.0)
    
    def test_render_placement(self, tmp_path):
        """Test rendering a placement to SVG."""
        # Create simple placement
        fabric = Fabric(width=100, cost_per_unit_length=1.0)
        piece = Piece(
            id="test",
            contour=[Point(0, 0), Point(20, 0), Point(20, 20), Point(0, 20)]
        )
        placed_piece = PlacedPiece(piece=piece, position=Point(10, 10))
        
        placement = Placement(fabric=fabric, placed_pieces=[placed_piece])
        placement.calculate_length()
        placement.calculate_cost()
        
        output_file = tmp_path / "output.svg"
        
        self.renderer.render_placement(
            placement,
            str(output_file),
            title="Test Placement"
        )
        
        assert output_file.exists()
        
        # Check SVG content
        content = output_file.read_text()
        assert "<?xml" in content
        assert "<svg" in content
        assert "</svg>" in content
        assert "Test Placement" in content
    
    def test_render_multiple_pieces(self, tmp_path):
        """Test rendering placement with multiple pieces."""
        fabric = Fabric(width=100, cost_per_unit_length=1.0)
        
        piece1 = Piece(
            id="piece1",
            contour=[Point(0, 0), Point(20, 0), Point(20, 20), Point(0, 20)]
        )
        piece2 = Piece(
            id="piece2",
            contour=[Point(0, 0), Point(30, 0), Point(30, 10), Point(0, 10)]
        )
        
        placed1 = PlacedPiece(piece=piece1, position=Point(10, 10))
        placed2 = PlacedPiece(piece=piece2, position=Point(10, 40))
        
        placement = Placement(fabric=fabric, placed_pieces=[placed1, placed2])
        placement.calculate_length()
        
        output_file = tmp_path / "output.svg"
        self.renderer.render_placement(placement, str(output_file))
        
        assert output_file.exists()
        content = output_file.read_text()
        assert "piece1" in content
        assert "piece2" in content


class TestSVGIntegration:
    """Integration tests for SVG parsing and rendering."""
    
    def test_svg_roundtrip(self, tmp_path):
        """Test creating SVG with pieces and parsing it back."""
        # Create sample pieces
        pieces = [
            Piece(
                id="panel_a",
                contour=[Point(0, 0), Point(40, 0), Point(40, 60), Point(0, 60)],
                multiplicity=2,
                seam_allowance=1.5,
                labels={"name": "Panel A"}
            ),
            Piece(
                id="panel_b",
                contour=[Point(0, 0), Point(30, 0), Point(30, 50), Point(0, 50)],
                multiplicity=1,
                seam_allowance=1.0,
                labels={"name": "Panel B"}
            ),
        ]
        
        # Create and solve placement
        orchestrator = create_orchestrator(algorithm="greedy")
        fabric = Fabric(width=150, cost_per_unit_length=10)
        
        placements = orchestrator.solve(pieces, fabric)
        
        assert len(placements) > 0
        placement = placements[0]
        
        # Render to SVG
        output_file = tmp_path / "placement.svg"
        orchestrator.save_best_placement_as_svg(placement, str(output_file))
        
        assert output_file.exists()
        
        # Verify SVG content
        content = output_file.read_text()
        assert "<?xml" in content
        assert "-" in content or "poly" in content.lower()  # Path or polygon elements


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
