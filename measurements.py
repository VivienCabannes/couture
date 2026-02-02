"""Measurement dataclasses for pattern drafting.

Measurements are derived from female body measurements according to French
sizing standards (T36-T44), with T38 as the base size.

TODO:
- Rewrite the Corset, Sleeve measurements based on the class, while working on the pattern (corset pattern, sleeve pattern).
- Rewrite the Skirt based on the class while working of the pattern (skirt pattern).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum, auto
from typing import ClassVar


@dataclass
class Measurements:
    """Base class for measurements with stretch support."""
    stretched: bool = field(default=False, kw_only=True)

    _horizontal: ClassVar[list[str]] = []
    _vertical: ClassVar[list[str]] = []

    def stretch(self, horizontal: float = 0.0, vertical: float = 0.0, usage: float = 1) -> None:
        """
        Apply stretch factors in place.

        Args:
            horizontal: Fabric horizontal stretch capacity (0.0 = none, 1.0 = 100%)
            vertical: Fabric vertical stretch capacity (0.0 = none, 1.0 = 100%)
            usage: How much of the stretch to use (0.5 = 50% for comfort)
        """
        h = 1 / (1 + horizontal * usage)
        v = 1 / (1 + vertical * usage)
        for field_name in self._horizontal:
            setattr(self, field_name, getattr(self, field_name) * h)
        for field_name in self._vertical:
            setattr(self, field_name, getattr(self, field_name) * v)
        self.stretched = True


@dataclass
class FullMeasurements(Measurements):
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
        "shoulder_length",            # 12. Longueur d'épaule
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
    """
    Return FullMeasurements for a standard French size.
    Based on French sizing table (T36-T44), with T38 as base.
    Supported sizes: 34, 36, 38, 40, 42, 44, 46, 48.
    """
    # (base T38, increment per size) from French sizing table
    table: dict[str, tuple[float, float]] = {
        "back_waist_length":        (41.0,  0.5),   # 1. Longueur taille dos
        "front_waist_length":       (37.0,  0.5),   # 2. Longueur taille devant
        "full_bust":                (88.0,  4.0),   # 3. Tour de poitrine
        "bust_height":              (22.0,  0.5),   # 4. Hauteur de poitrine
        "half_bust_point_distance": (9.25,  0.25),  # 5. 1/2 écart de poitrine
        "full_waist":               (68.0,  4.0),   # 6. Tour de taille
        "small_hip":                (85.0,  4.0),   # 7. Tour des petites hanches
        "full_hip":                 (94.0,  4.0),   # 8. Tour de bassin (grandes hanches)
        "neck_circumference":       (36.0,  1.0),   # 9. Tour d'encollure
        "half_back_width":          (17.5,  0.25),  # 10. 1/2 carrure dos
        "half_front_width":         (16.5,  0.25),  # 11. 1/2 carrure devant
        "shoulder_length":          (12.0,  0.4),   # 12. Longueur d'épaule
        "armhole_circumference":    (39.5,  1.0),   # 13. Tour d'emmanchure
        "underarm_height":          (21.5,  0.25),  # 14. Hauteur dessous de bras
        "arm_length":               (60.0,  0.0),   # 15. Longueur de bras
        "upper_arm":                (26.0,  1.0),   # 16. Grosseur de bras
        "elbow_height":             (35.0,  0.0),   # 17. Hauteur coude
        "wrist":                    (16.0,  0.25),  # 18. Tour de poignet
        "waist_to_hip":             (22.0,  0.0),   # 19. Hauteur taille-bassin
        "crotch_depth":             (26.5,  0.5),   # 20. Hauteur de montant
        "crotch_length":            (60.0,  2.0),   # 21. Enfourchure
        "waist_to_knee":            (58.0,  1.0),   # 22. Hauteur taille au genou
        "waist_to_floor":           (105.0, 0.5),   # 23. Hauteur taille à terre
        "side_waist_to_floor":      (105.5, 1.0),   # 24. Hauteur taille côté à terre
    }

    size_diff = (size - 38) // 2
    measurements = {
        name: base + (incr * size_diff)
        for name, (base, incr) in table.items()
    }

    return FullMeasurements(**measurements)


class Person(StrEnum):
    Kwama = auto()
    Vivien = auto()


def individual_measurements(person: Person | str) -> FullMeasurements:
    """
    Return FullMeasurements for a specific individual.
    """
    if isinstance(person, str):
        person = Person(person)

    match person:
        case Person.Vivien:
            measurements = {
                "back_waist_length":        43.5,   # 1. Longueur taille dos
                "front_waist_length":       39.5,   # 2. Longueur taille devant
                "full_bust":                102.0,  # 3. Tour de poitrine
                "bust_height":              22.0,   # 4. Hauteur de poitrine
                "half_bust_point_distance": 11.0,   # 5. 1/2 écart de poitrine
                "full_waist":               83.0,   # 6. Tour de taille
                "small_hip":                94.0,   # 7. Tour des petites hanches
                "full_hip":                 101.0,  # 8. Tour de bassin
                "neck_circumference":       41.0,   # 9. Tour d'encollure
                "half_back_width":          19.5,   # 10. 1/2 carrure dos
                "half_front_width":         18.5,   # 11. 1/2 carrure devant
                "shoulder_length":          13.0,   # 12. Longueur d'épaule
                "armhole_circumference":    50.0,   # 13. Tour d'emmanchure
                "underarm_height":          27.5,   # 14. Hauteur dessous de bras
                "arm_length":               66.0,   # 15. Longueur de bras
                "upper_arm":                33.0,   # 16. Grosseur de bras
                "elbow_height":             40.0,   # 17. Hauteur coude
                "wrist":                    17.5,   # 18. Tour de poignet
                "waist_to_hip":             25.0,   # 19. Hauteur taille-bassin
                "crotch_depth":             32.0,   # 20. Hauteur de montant
                "crotch_length":            85.0,   # 21. Enfourchure
                "waist_to_knee":            67.0,   # 22. Hauteur taille au genou
                "waist_to_floor":           126.0,  # 23. Hauteur taille à terre
                "side_waist_to_floor":      127.0,  # 24. Hauteur taille côté à terre
            }
        case Person.Kwama:
            measurements = {
                "back_waist_length":        40.5,   # 1. Longueur taille dos
                "front_waist_length":       36.5,   # 2. Longueur taille devant
                "full_bust":                90.0,   # 3. Tour de poitrine
                "bust_height":              22.0,   # 4. Hauteur de poitrine
                "half_bust_point_distance": 9.5,    # 5. 1/2 écart de poitrine
                "full_waist":               73.0,   # 6. Tour de taille
                "small_hip":                80.5,   # 7. Tour des petites hanches
                "full_hip":                 100.0,  # 8. Tour de bassin
                "neck_circumference":       36.0,   # 9. Tour d'encollure
                "half_back_width":          17.5,   # 10. 1/2 carrure dos
                "half_front_width":         16.5,   # 11. 1/2 carrure devant
                "shoulder_length":          12.0,   # 12. Longueur d'épaule
                "armhole_circumference":    40.0,   # 13. Tour d'emmanchure
                "underarm_height":          22.0,   # 14. Hauteur dessous de bras
                "arm_length":               60.0,   # 15. Longueur de bras
                "upper_arm":                28.0,   # 16. Grosseur de bras
                "elbow_height":             33.0,   # 17. Hauteur coude
                "wrist":                    15.0,   # 18. Tour de poignet
                "waist_to_hip":             22.0,   # 19. Hauteur taille-bassin
                "crotch_depth":             26.5,   # 20. Hauteur de montant
                "crotch_length":            62.0,   # 21. Enfourchure
                "waist_to_knee":            58.0,   # 22. Hauteur taille au genou
                "waist_to_floor":           105.0,  # 23. Hauteur taille à terre
                "side_waist_to_floor":      106.0,  # 24. Hauteur taille côté à terre
            }
        case _:
            raise NotImplementedError("Unknown Person")

    return FullMeasurements(**measurements)


@dataclass
class SkirtMeasurements(Measurements):
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
            stretched=m.stretched,
        )


@dataclass
class CorsetMeasurements(Measurements):
    """Measurements for corset patterns / Mesures pour patron de corset."""
    full_bust: float            # tour de poitrine
    underbust: float            # tour de dessous de poitrine
    full_waist: float           # tour de taille
    full_hip: float             # tour de hanches
    front_waist_length: float   # longueur taille devant
    back_waist_length: float    # longueur taille dos
    side_length: float          # longueur côté (aisselle à taille)
    bust_point_distance: float  # écart poitrine
    bust_height: float          # hauteur poitrine (épaule à pointe)

    _horizontal: ClassVar[list[str]] = [
        "full_bust",            # tour de poitrine
        "underbust",            # tour de dessous de poitrine
        "full_waist",           # tour de taille
        "full_hip",             # tour de hanches
        "bust_point_distance",  # écart poitrine
    ]
    _vertical: ClassVar[list[str]] = [
        "front_waist_length",   # longueur taille devant
        "back_waist_length",    # longueur taille dos
        "side_length",          # longueur côté
        "bust_height",          # hauteur poitrine
    ]

    @classmethod
    def from_full(
        cls,
        m: FullMeasurements,
        underbust: float = 74.0,
        side_length: float | None = None,
    ) -> CorsetMeasurements:
        """Create from FullMeasurements."""
        if side_length is None:
            side_length = m.underarm_height - 3.0  # approximate
        return cls(
            full_bust=m.full_bust,
            underbust=underbust,
            full_waist=m.full_waist,
            full_hip=m.full_hip,
            front_waist_length=m.front_waist_length,
            back_waist_length=m.back_waist_length,
            side_length=side_length,
            bust_point_distance=m.half_bust_point_distance * 2,
            bust_height=m.bust_height,
            stretched=m.stretched,
        )


@dataclass
class SleeveMeasurements(Measurements):
    """Measurements for sleeve patterns / Mesures pour patron de manche."""
    upper_arm: float         # tour de bras
    elbow: float             # tour de coude
    wrist: float             # tour de poignet
    arm_length: float        # longueur de bras
    underarm_length: float   # longueur de dessous de bras
    shoulder_to_elbow: float # longueur épaule-coude
    armhole_depth: float     # profondeur emmanchure

    _horizontal: ClassVar[list[str]] = [
        "upper_arm",         # tour de bras
        "elbow",             # tour de coude
        "wrist",             # tour de poignet
    ]
    _vertical: ClassVar[list[str]] = [
        "arm_length",        # longueur de bras
        "underarm_length",   # longueur de dessous de bras
        "shoulder_to_elbow", # longueur épaule-coude
        "armhole_depth",     # profondeur emmanchure
    ]

    @classmethod
    def from_full(
        cls,
        m: FullMeasurements,
        elbow: float | None = None,
        armhole_depth: float | None = None,
    ) -> SleeveMeasurements:
        """Create from FullMeasurements."""
        if elbow is None:
            elbow = m.upper_arm * 0.85  # approximate
        if armhole_depth is None:
            armhole_depth = m.armhole_circumference / 2  # approximate
        return cls(
            upper_arm=m.upper_arm,
            elbow=elbow,
            wrist=m.wrist,
            arm_length=m.arm_length,
            underarm_length=m.arm_length - m.underarm_height,
            shoulder_to_elbow=m.elbow_height,
            armhole_depth=armhole_depth,
            stretched=m.stretched,
        )

