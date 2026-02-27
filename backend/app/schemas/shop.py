"""Pydantic models for garment-related API endpoints."""

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
