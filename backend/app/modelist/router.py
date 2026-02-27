"""Pattern generation API — generate pattern pieces from measurements."""

import warnings

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.core.measurements import FullMeasurements
from app.modelist.corset import (
    CorsetMeasurements,
    ControlParameters as CorsetControlParameters,
    CorsetPattern,
)
from app.modelist.sleeve import (
    SleeveMeasurements,
    ControlParameters as SleeveControlParameters,
    SleevePattern,
)
from app.schemas.patterns import (
    ControlParameterDefinition,
    MeasurementFieldDefinition,
    OutputFormat,
    PatternRequest,
    PatternResponse,
    PatternType,
    PatternTypeInfo,
)

router = APIRouter(prefix="/api/modelist", tags=["modelist"])


PATTERN_TYPE_INFO: dict[PatternType, PatternTypeInfo] = {
    PatternType.corset: PatternTypeInfo(
        name="corset",
        label="Corset / Bodice Block",
        required_measurements=[
            MeasurementFieldDefinition(name="back_waist_length", description="Longueur taille dos"),
            MeasurementFieldDefinition(name="front_waist_length", description="Longueur taille devant"),
            MeasurementFieldDefinition(name="full_bust", description="Tour de poitrine"),
            MeasurementFieldDefinition(name="bust_height", description="Hauteur de poitrine"),
            MeasurementFieldDefinition(name="half_bust_point_distance", description="1/2 écart de poitrine"),
            MeasurementFieldDefinition(name="full_waist", description="Tour de taille"),
            MeasurementFieldDefinition(name="small_hip", description="Tour des petites hanches"),
            MeasurementFieldDefinition(name="full_hip", description="Tour de bassin"),
            MeasurementFieldDefinition(name="neck_circumference", description="Tour d'encollure"),
            MeasurementFieldDefinition(name="half_back_width", description="1/2 carrure dos"),
            MeasurementFieldDefinition(name="half_front_width", description="1/2 carrure devant"),
            MeasurementFieldDefinition(name="shoulder_length", description="Longueur d'épaule"),
            MeasurementFieldDefinition(name="underarm_height", description="Hauteur dessous de bras"),
            MeasurementFieldDefinition(name="waist_to_hip", description="Hauteur taille-bassin"),
        ],
        control_parameters=[
            ControlParameterDefinition(name="front_neck_center", default=0.8, description="Ratio for front neck center Bezier control"),
            ControlParameterDefinition(name="back_neck_center", default=0.5, description="Ratio for back neck center Bezier control"),
            ControlParameterDefinition(name="front_neck_top", default=0.34, description="Ratio for front neck top Bezier control"),
            ControlParameterDefinition(name="back_neck_top", default=0.20, description="Ratio for back neck top Bezier control"),
            ControlParameterDefinition(name="armhole_curve", default=0.4, description="Ratio for armhole curve offset"),
        ],
        supports_stretch=True,
    ),
    PatternType.sleeve: PatternTypeInfo(
        name="sleeve",
        label="Jersey Set-In Sleeve",
        required_measurements=[
            MeasurementFieldDefinition(name="armhole_depth", description="Profondeur d'emmanchure"),
            MeasurementFieldDefinition(name="armhole_measurement", description="Mesure d'emmanchure totale"),
            MeasurementFieldDefinition(name="sleeve_length", description="Longueur de manche"),
            MeasurementFieldDefinition(name="upper_arm_to_elbow", description="Distance épaule-coude"),
            MeasurementFieldDefinition(name="sleeve_bottom_width", description="Largeur bas de manche"),
        ],
        control_parameters=[
            ControlParameterDefinition(name="g3_perpendicular", default=1.0, description="Perpendicular offset for G3 (cm)"),
            ControlParameterDefinition(name="h3_perpendicular", default=1.5, description="Perpendicular offset for H3 (cm)"),
        ],
        supports_stretch=True,
    ),
}


@router.get("/patterns", response_model=list[PatternTypeInfo])
def list_pattern_types():
    """List available pattern types with their required measurements and control parameters."""
    return list(PATTERN_TYPE_INFO.values())


def _build_corset(req: PatternRequest):
    """Build a corset pattern from request data."""
    fm = FullMeasurements(**req.measurements)
    corset_m = CorsetMeasurements.from_full_measurements(fm)

    control = CorsetControlParameters()
    if req.control_parameters:
        for key, value in req.control_parameters.items():
            if hasattr(control, key):
                setattr(control, key, value)

    pattern = CorsetPattern(corset_m, control)

    if req.stretch:
        pattern.stretch(
            horizontal=req.stretch.horizontal,
            vertical=req.stretch.vertical,
            usage=req.stretch.usage,
        )

    return pattern


def _build_sleeve(req: PatternRequest):
    """Build a sleeve pattern from request data."""
    sleeve_m = SleeveMeasurements(**req.measurements)

    control = SleeveControlParameters()
    if req.control_parameters:
        for key, value in req.control_parameters.items():
            if hasattr(control, key):
                setattr(control, key, value)

    pattern = SleevePattern(sleeve_m, control)

    if req.stretch:
        pattern.stretch(
            horizontal=req.stretch.horizontal,
            vertical=req.stretch.vertical,
            usage=req.stretch.usage,
        )

    return pattern


@router.post("/generate")
def generate_pattern(req: PatternRequest):
    """Generate a pattern from measurements."""
    captured_warnings: list[str] = []

    try:
        # Build the pattern with warning capture
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")

            if req.pattern_type == PatternType.corset:
                pattern = _build_corset(req)
            elif req.pattern_type == PatternType.sleeve:
                pattern = _build_sleeve(req)
            else:
                raise HTTPException(status_code=400, detail=f"Unknown pattern type: {req.pattern_type}")

            captured_warnings = [str(warning.message) for warning in w]

        # Generate output based on format
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")

            if req.output_format == OutputFormat.svg:
                svg_content = pattern.render_svg("construction")
                captured_warnings.extend(str(warning.message) for warning in w)
                return Response(content=svg_content, media_type="image/svg+xml")

            if req.output_format == OutputFormat.pdf:
                pdf_content = pattern.render_pdf("construction")
                captured_warnings.extend(str(warning.message) for warning in w)
                return Response(content=pdf_content, media_type="application/pdf")

            # output_format == "all"
            construction_svg = pattern.render_svg("construction")
            pattern_svg = pattern.render_svg("pattern")
            captured_warnings.extend(str(warning.message) for warning in w)

            return PatternResponse(
                construction_svg=construction_svg,
                pattern_svg=pattern_svg,
                warnings=captured_warnings,
            )

    except (TypeError, ValueError, KeyError) as e:
        raise HTTPException(status_code=422, detail=str(e))
