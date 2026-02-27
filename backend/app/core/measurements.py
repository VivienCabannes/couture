"""Measurement dataclasses for pattern drafting.

Measurements are derived from female body measurements according to French
sizing standards (T36-T44), with T38 as the base size.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import ClassVar


@dataclass
class FullMeasurements:
    """Complete body measurements in centimeters (French sizing table)."""
    back_waist_length: float          # 1. Longueur taille dos
    front_waist_length: float         # 2. Longueur taille devant
    full_bust: float                  # 3. Tour de poitrine
    bust_height: float                # 4. Hauteur de poitrine
    half_bust_point_distance: float   # 5. 1/2 écart de poitrine
    full_waist: float                 # 6. Tour de taille
    small_hip: float                  # 7. Tour des petites hanches
    full_hip: float                   # 8. Tour de bassin
    neck_circumference: float         # 9. Tour d'encollure
    half_back_width: float            # 10. 1/2 carrure dos
    half_front_width: float           # 11. 1/2 carrure devant
    shoulder_length: float            # 12. Longueur d'épaule
    armhole_circumference: float      # 13. Tour d'emmanchure
    underarm_height: float            # 14. Hauteur dessous de bras
    arm_length: float                 # 15. Longueur de bras
    upper_arm: float                  # 16. Grosseur de bras
    elbow_height: float               # 17. Hauteur coude
    wrist: float                      # 18. Tour de poignet
    waist_to_hip: float               # 19. Hauteur taille-bassin
    crotch_depth: float               # 20. Hauteur de montant
    crotch_length: float              # 21. Enfourchure
    waist_to_knee: float              # 22. Hauteur taille au genou
    waist_to_floor: float             # 23. Hauteur taille à terre
    side_waist_to_floor: float        # 24. Hauteur taille côté à terre

    _horizontal: ClassVar[list[str]] = [
        "full_bust",                  # 3. Tour de poitrine
        "half_bust_point_distance",   # 5. 1/2 écart de poitrine
        "full_waist",                 # 6. Tour de taille
        "small_hip",                  # 7. Tour des petites hanches
        "full_hip",                   # 8. Tour de bassin
        "neck_circumference",         # 9. Tour d'encollure
        "half_back_width",            # 10. 1/2 carrure dos
        "half_front_width",           # 11. 1/2 carrure devant
        "armhole_circumference",      # 13. Tour d'emmanchure
        "upper_arm",                  # 16. Grosseur de bras
        "wrist",                      # 18. Tour de poignet
        "crotch_length",              # 21. Enfourchure
    ]
    _vertical: ClassVar[list[str]] = [
        "back_waist_length",          # 1. Longueur taille dos
        "front_waist_length",         # 2. Longueur taille devant
        "bust_height",                # 4. Hauteur de poitrine
        "underarm_height",            # 14. Hauteur dessous de bras
        "arm_length",                 # 15. Longueur de bras
        "elbow_height",               # 17. Hauteur coude
        "waist_to_hip",               # 19. Hauteur taille-bassin
        "crotch_depth",               # 20. Hauteur de montant
        "waist_to_knee",              # 22. Hauteur taille au genou
        "waist_to_floor",             # 23. Hauteur taille à terre
        "side_waist_to_floor",        # 24. Hauteur taille côté à terre
    ]


def default_measurements(size: int = 38) -> FullMeasurements:
    """Return FullMeasurements for a standard French size.

    Based on French sizing table (T36-T44), with T38 as base.
    Supported sizes: 34, 36, 38, 40, 42, 44, 46, 48.
    """
    # (base T38, increment per size) from French sizing table
    table: dict[str, tuple[float, float]] = {
        "back_waist_length":        (41.0,  0.5),
        "front_waist_length":       (37.0,  0.5),
        "full_bust":                (88.0,  4.0),
        "bust_height":              (22.0,  0.5),
        "half_bust_point_distance": (9.25,  0.25),
        "full_waist":               (68.0,  4.0),
        "small_hip":                (85.0,  4.0),
        "full_hip":                 (94.0,  4.0),
        "neck_circumference":       (36.0,  1.0),
        "half_back_width":          (17.5,  0.25),
        "half_front_width":         (16.5,  0.25),
        "shoulder_length":          (12.0,  0.4),
        "armhole_circumference":    (39.5,  1.0),
        "underarm_height":          (21.5,  0.25),
        "arm_length":               (60.0,  0.0),
        "upper_arm":                (26.0,  1.0),
        "elbow_height":             (35.0,  0.0),
        "wrist":                    (16.0,  0.25),
        "waist_to_hip":             (22.0,  0.0),
        "crotch_depth":             (26.5,  0.5),
        "crotch_length":            (60.0,  2.0),
        "waist_to_knee":            (58.0,  1.0),
        "waist_to_floor":           (105.0, 0.5),
        "side_waist_to_floor":      (105.5, 1.0),
    }

    size_diff = (size - 38) // 2
    measurements = {
        name: base + (incr * size_diff)
        for name, (base, incr) in table.items()
    }

    return FullMeasurements(**measurements)
