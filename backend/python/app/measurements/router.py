"""Measurements API — standard sizes, default measurements, and saved measurements."""

from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.measurements import Person, default_measurements, individual_measurements
from app.core.models import SavedMeasurements
from app.schemas.measurements import (
    MeasurementsResponse,
    SavedMeasurementsRequest,
    SavedMeasurementsResponse,
)
from database import get_db

router = APIRouter(prefix="/api/measurements", tags=["measurements"])

AVAILABLE_SIZES = [34, 36, 38, 40, 42, 44, 46, 48]
AVAILABLE_PRESETS = [p.value for p in Person]


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


@router.get("/presets", response_model=list[str])
def list_presets():
    """List available individual measurement presets."""
    return AVAILABLE_PRESETS


@router.get("/presets/{person}", response_model=MeasurementsResponse)
def get_preset_measurements(person: str):
    """Get measurements for a specific individual preset."""
    try:
        fm = individual_measurements(person)
    except (ValueError, NotImplementedError):
        raise HTTPException(
            status_code=404,
            detail=f"Preset '{person}' not found. Choose from {AVAILABLE_PRESETS}",
        )
    return MeasurementsResponse(**asdict(fm))


@router.get("", response_model=SavedMeasurementsResponse)
def get_saved_measurements(db: Session = Depends(get_db)):
    """Return saved measurements, or defaults for size 38 if none saved."""
    row = db.query(SavedMeasurements).filter(SavedMeasurements.id == 1).first()
    if row and row.values:
        return SavedMeasurementsResponse(
            size=row.size,
            values=row.values,
            idk=row.idk or {},
        )
    fm = default_measurements(38)
    return SavedMeasurementsResponse(
        size=38,
        values=asdict(fm),
        idk={},
    )


@router.put("", response_model=SavedMeasurementsResponse)
def save_measurements(body: SavedMeasurementsRequest, db: Session = Depends(get_db)):
    """Save user measurements (upsert singleton row)."""
    row = db.query(SavedMeasurements).filter(SavedMeasurements.id == 1).first()
    if row:
        row.size = body.size
        row.values = body.values
        row.idk = body.idk or {}
    else:
        row = SavedMeasurements(id=1, size=body.size, values=body.values, idk=body.idk or {})
        db.add(row)
    db.commit()
    db.refresh(row)
    return SavedMeasurementsResponse(
        size=row.size,
        values=row.values,
        idk=row.idk or {},
    )
