"""Unit tests for pattern render methods."""

import pytest

from app.core.measurements import default_measurements
from app.patterns.corset import CorsetPattern, CorsetMeasurements, ControlParameters as CorsetControlParameters
from app.patterns.sleeve import SleevePattern, SleeveMeasurements, ControlParameters as SleeveControlParameters
from app.patterns.baby_dress import Params as BabyDressParams, generate_svg_string


class TestCorsetRender:
    @pytest.fixture
    def pattern(self):
        fm = default_measurements(size=38)
        corset_m = CorsetMeasurements.from_full_measurements(fm)
        return CorsetPattern(corset_m)

    def test_render_construction_svg(self, pattern):
        svg = pattern.render_svg("construction")
        assert isinstance(svg, str)
        assert "<svg" in svg
        assert "</svg>" in svg

    def test_render_pattern_svg(self, pattern):
        svg = pattern.render_svg("pattern")
        assert isinstance(svg, str)
        assert "<svg" in svg

    def test_render_construction_pdf(self, pattern):
        pdf = pattern.render_pdf("construction")
        assert isinstance(pdf, bytes)
        assert pdf[:5] == b"%PDF-"

    def test_render_pattern_pdf(self, pattern):
        pdf = pattern.render_pdf("pattern")
        assert isinstance(pdf, bytes)
        assert pdf[:5] == b"%PDF-"

    def test_render_with_stretch(self, pattern):
        pattern.stretch(horizontal=0.2, vertical=0.1)
        svg = pattern.render_svg("construction")
        assert "<svg" in svg


class TestSleeveRender:
    @pytest.fixture
    def pattern(self):
        sleeve_m = SleeveMeasurements(
            armhole_depth=19.5,
            armhole_measurement=45,
            sleeve_length=66.0,
            upper_arm_to_elbow=35.0,
            sleeve_bottom_width=20.0,
        )
        return SleevePattern(sleeve_m)

    def test_render_construction_svg(self, pattern):
        svg = pattern.render_svg("construction")
        assert isinstance(svg, str)
        assert "<svg" in svg

    def test_render_pattern_svg(self, pattern):
        svg = pattern.render_svg("pattern")
        assert isinstance(svg, str)
        assert "<svg" in svg

    def test_render_construction_pdf(self, pattern):
        pdf = pattern.render_pdf("construction")
        assert isinstance(pdf, bytes)
        assert pdf[:5] == b"%PDF-"

    def test_render_pattern_pdf(self, pattern):
        pdf = pattern.render_pdf("pattern")
        assert isinstance(pdf, bytes)
        assert pdf[:5] == b"%PDF-"


class TestBabyDressRender:
    def test_generate_svg_string(self):
        params = BabyDressParams()
        svg = generate_svg_string(params)
        assert isinstance(svg, str)
        assert "<svg" in svg
        assert "</svg>" in svg
