"""Unit tests for Bezier curve P0-P1 and P3-P2 line crossing validation."""

import warnings
import numpy as np
import pytest

from corset_pattern import CorsetPattern, CorsetMeasurements, ControlParameters
from measurements import default_measurements


class TestBezierP0P1Validation:
    """Tests for _validate_bezier_crossing method."""

    @pytest.fixture
    def pattern(self):
        """Create a pattern instance for testing."""
        fm = default_measurements(size=38)
        corset_m = CorsetMeasurements.from_full_measurements(fm)
        return CorsetPattern(corset_m)

    def test_valid_curve_no_crossing(self, pattern):
        """Test that a valid curve (no crossing) does not raise a warning."""
        # All control points on the same side of P0-P1 line
        p0 = np.array([0.0, 0.0])
        p1 = np.array([1.0, 0.0])
        p2 = np.array([2.0, 1.0])  # Above the P0-P1 line
        p3 = np.array([3.0, 1.0])  # Above the P0-P1 line

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_valid")
            assert result is True
            assert len(w) == 0

    def test_crossing_p0_p1_line_raises_warning(self, pattern):
        """Test that crossing the P0-P1 line raises a UserWarning."""
        # P2 above the line, P3 below -> crossing
        p0 = np.array([0.0, 0.0])
        p1 = np.array([1.0, 0.0])
        p2 = np.array([2.0, 1.0])   # Above the P0-P1 line
        p3 = np.array([3.0, -1.0])  # Below the P0-P1 line

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_crossing")
            assert result is False
            assert len(w) == 1
            assert issubclass(w[0].category, UserWarning)
            assert "test_crossing" in str(w[0].message)
            assert "crosses the P0-P1 line" in str(w[0].message)

    def test_crossing_p3_p2_line_raises_warning(self, pattern):
        """Test that crossing the P3-P2 line raises a UserWarning."""
        # P0 and P1 on opposite sides of the P3-P2 line
        p0 = np.array([0.0, 1.0])   # Above the P3-P2 line
        p1 = np.array([1.0, -1.0])  # Below the P3-P2 line
        p2 = np.array([2.0, 0.0])
        p3 = np.array([3.0, 0.0])

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_p3p2_crossing")
            assert result is False
            assert any("crosses the P3-P2 line" in str(warning.message) for warning in w)

    def test_crossing_both_lines_raises_two_warnings(self, pattern):
        """Test that crossing both lines raises two warnings."""
        # Construct a curve that crosses both P0-P1 and P3-P2 lines
        p0 = np.array([0.0, 0.0])
        p1 = np.array([1.0, 1.0])
        p2 = np.array([2.0, -1.0])  # Opposite side from P1 relative to P3-P2
        p3 = np.array([3.0, 0.0])

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_both_crossing")
            assert result is False
            # Should have two warnings
            crossing_warnings = [warning for warning in w if "crosses" in str(warning.message)]
            assert len(crossing_warnings) == 2

    def test_degenerate_case_p0_equals_p1(self, pattern):
        """Test that degenerate case (P0==P1) skips P0-P1 validation gracefully."""
        p0 = np.array([1.0, 1.0])
        p1 = np.array([1.0, 1.0])  # Same as P0
        p2 = np.array([2.0, 2.0])
        p3 = np.array([3.0, 2.0])

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_degenerate_p0p1")
            assert result is True
            # Should not have P0-P1 crossing warnings
            p0p1_warnings = [warning for warning in w if "P0-P1" in str(warning.message)]
            assert len(p0p1_warnings) == 0

    def test_degenerate_case_p2_equals_p3(self, pattern):
        """Test that degenerate case (P2==P3) skips P3-P2 validation gracefully."""
        p0 = np.array([0.0, 0.0])
        p1 = np.array([1.0, 1.0])
        p2 = np.array([2.0, 2.0])
        p3 = np.array([2.0, 2.0])  # Same as P2

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_degenerate_p3p2")
            assert result is True
            # Should not have P3-P2 crossing warnings
            p3p2_warnings = [warning for warning in w if "P3-P2" in str(warning.message)]
            assert len(p3p2_warnings) == 0

    def test_points_on_line_no_crossing(self, pattern):
        """Test that points exactly on the P0-P1 line don't trigger crossing."""
        p0 = np.array([0.0, 0.0])
        p1 = np.array([1.0, 0.0])
        p2 = np.array([2.0, 0.0])  # On the line
        p3 = np.array([3.0, 0.0])  # On the line

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_on_line")
            assert result is True
            assert len(w) == 0

    def test_both_control_points_same_side_positive(self, pattern):
        """Test both P2 and P3 above the line (same sign cross products)."""
        p0 = np.array([0.0, 0.0])
        p1 = np.array([1.0, 0.0])
        p2 = np.array([0.5, 2.0])  # Above
        p3 = np.array([1.5, 1.0])  # Above

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_same_side_pos")
            assert result is True
            assert len(w) == 0

    def test_both_control_points_same_side_negative(self, pattern):
        """Test both P2 and P3 below the line (same sign cross products)."""
        p0 = np.array([0.0, 0.0])
        p1 = np.array([1.0, 0.0])
        p2 = np.array([0.5, -2.0])  # Below
        p3 = np.array([1.5, -1.0])  # Below

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = pattern._validate_bezier_crossing(p0, p1, p2, p3, "test_same_side_neg")
            assert result is True
            assert len(w) == 0

    def test_existing_pattern_curves_pass_validation(self, pattern):
        """Test that all curves in the default pattern pass validation."""
        # Generate the pattern output which draws all curves
        pattern.pattern_gap = 5.0

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            # Call the drawing methods which invoke validation
            import matplotlib.pyplot as plt
            fig, ax = plt.subplots()
            pattern._plot_front_curves(ax)
            pattern._plot_back_curves(ax)
            plt.close(fig)

            # Filter for our specific warnings
            crossing_warnings = [
                warning for warning in w
                if "crosses the P0-P1 line" in str(warning.message) or
                   "crosses the P3-P2 line" in str(warning.message)
            ]
            assert len(crossing_warnings) == 0, (
                f"Pattern curves should not cross control lines, but got warnings: "
                f"{[str(warning.message) for warning in crossing_warnings]}"
            )

    def test_unnamed_curve_warning_message(self, pattern):
        """Test that unnamed curves show 'unnamed' in warning message."""
        p0 = np.array([0.0, 0.0])
        p1 = np.array([1.0, 0.0])
        p2 = np.array([2.0, 1.0])
        p3 = np.array([3.0, -1.0])

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            pattern._validate_bezier_crossing(p0, p1, p2, p3)  # No curve_name
            assert len(w) >= 1
            assert "unnamed" in str(w[0].message)
