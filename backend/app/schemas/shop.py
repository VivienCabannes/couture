"""Pydantic models for garment-related API endpoints."""

from typing import Optional

from pydantic import BaseModel


class PieceInfo(BaseModel):
    """A single pattern piece within a garment."""
    pattern_type: str
    label: str


class GarmentInfo(BaseModel):
    """A garment type with its constituent pattern pieces."""
    name: str
    label: str
    pieces: list[PieceInfo]


class GarmentSelectionResponse(BaseModel):
    """A selected garment with its adjustments."""
    garment_name: str
    added_at: float
    adjustments: Optional[dict] = None


class AdjustmentsUpdate(BaseModel):
    """Request body for updating per-piece adjustments."""
    adjustments: dict
