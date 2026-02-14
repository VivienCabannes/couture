from __future__ import annotations

from dataclasses import dataclass
from typing import ClassVar

from app.core.measurements import FullMeasurements


@dataclass
class SkirtMeasurements:
    """Measurements for skirt patterns / Mesures pour patron de jupe."""
    full_waist: float      # tour de taille
    full_hip: float        # tour de hanches
    waist_to_hip: float    # hauteur taille-hanches
    waist_to_knee: float   # hauteur taille-genou
    waist_to_floor: float  # hauteur taille-sol
    skirt_length: float    # longueur jupe

    _horizontal: ClassVar[list[str]] = [
        "full_waist",      # tour de taille
        "full_hip",        # tour de hanches
    ]
    _vertical: ClassVar[list[str]] = [
        "waist_to_hip",    # hauteur taille-hanches
        "waist_to_knee",   # hauteur taille-genou
        "waist_to_floor",  # hauteur taille-sol
        "skirt_length",    # longueur jupe
    ]

    @classmethod
    def from_full(cls, m: FullMeasurements, skirt_length: float = 65.0) -> SkirtMeasurements:
        """Create from FullMeasurements."""
        return cls(
            full_waist=m.full_waist,
            full_hip=m.full_hip,
            waist_to_hip=m.waist_to_hip,
            waist_to_knee=m.waist_to_knee,
            waist_to_floor=m.waist_to_floor,
            skirt_length=skirt_length,
        )
