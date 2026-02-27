"""Measurements API — standard sizes and default measurements."""

from dataclasses import asdict

from fastapi import APIRouter, HTTPException

from app.core.measurements import default_measurements
from app.schemas.measurements import MeasurementsResponse

router = APIRouter(prefix="/api/measurements", tags=["measurements"])

AVAILABLE_SIZES = [34, 36, 38, 40, 42, 44, 46, 48]


@router.get("/sizes", response_model=list[int])
def list_sizes():
    """List available standard French sizes."""
    return AVAILABLE_SIZES


@router.get("/defaults/{size}", response_model=MeasurementsResponse)
def get_default_measurements(size: int):
    """Get default measurements for a standard French size."""
    if size not in AVAILABLE_SIZES:
        raise HTTPException(status_code=404, detail=f"Size {size} not available. Choose from {AVAILABLE_SIZES}")
    fm = default_measurements(size)
    return MeasurementsResponse(**asdict(fm))
