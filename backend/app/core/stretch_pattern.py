import numpy as np
from numpy.typing import NDArray


class StretchPattern:
    """Base class for pattern with stretch support."""
    def __init__(self):
        self.stretched: bool = False
        self.h_factor: float = 1.0
        self.v_factor: float = 1.0
        self.points: dict[str, NDArray[np.float64]] = {}
        self.helper_points: dict[str, NDArray[np.float64]] = {}

    def stretch(self, horizontal: float = 0.0, vertical: float = 0.0, usage: float = 1) -> None:
        """
        Apply stretch factors in place.

        Args:
            horizontal: Fabric horizontal stretch capacity (0.0 = none, 1.0 = 100%)
            vertical: Fabric vertical stretch capacity (0.0 = none, 1.0 = 100%)
            usage: How much of the stretch to use (0.5 = 50% for comfort)
        """
        if self.stretched:
            raise ValueError("Can not stretch a pattern that is already stretched.")
        h = 1 / (1 + horizontal * usage)
        v = 1 / (1 + vertical * usage)
        self.h_factor = h  # store for pattern-level use
        self.v_factor = v
        for key in self.points:
            self.points[key][0] *= h
            self.points[key][1] *= v
        for key in self.helper_points:
            self.helper_points[key][0] *= h
            self.helper_points[key][1] *= v
        self.stretched = True
