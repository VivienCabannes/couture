from enum import Enum
from typing import Optional

from pydantic import BaseModel


class PatternType(str, Enum):
    corset = "corset"
    sleeve = "sleeve"
    baby_dress = "baby_dress"


class OutputFormat(str, Enum):
    all = "all"
    svg = "svg"
    pdf = "pdf"


class StretchInput(BaseModel):
    horizontal: float = 0.0
    vertical: float = 0.0
    usage: float = 1.0


class PatternRequest(BaseModel):
    pattern_type: PatternType
    measurements: dict[str, float]
    control_parameters: Optional[dict[str, float]] = None
    stretch: Optional[StretchInput] = None
    output_format: OutputFormat = OutputFormat.all


class PatternResponse(BaseModel):
    construction_svg: str
    pattern_svg: str
    warnings: list[str] = []


class ControlParameterDefinition(BaseModel):
    name: str
    default: float
    description: str


class MeasurementFieldDefinition(BaseModel):
    name: str
    description: str


class PatternTypeInfo(BaseModel):
    name: str
    label: str
    required_measurements: list[MeasurementFieldDefinition]
    control_parameters: list[ControlParameterDefinition]
    supports_stretch: bool
