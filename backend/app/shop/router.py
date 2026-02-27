"""Garment discovery API — lists available garment types, pieces, and selections."""

import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.models import GarmentSelection
from app.schemas.shop import (
    AdjustmentsUpdate,
    GarmentInfo,
    GarmentSelectionResponse,
    PieceInfo,
)
from database import get_db

router = APIRouter(prefix="/api/shop", tags=["shop"])

GARMENTS: dict[str, GarmentInfo] = {
    "top": GarmentInfo(
        name="top",
        label="Top / Bodice Block",
        pieces=[
            PieceInfo(pattern_type="corset", label="Bodice"),
            PieceInfo(pattern_type="sleeve", label="Sleeve"),
        ],
    ),
}


@router.get("/garments", response_model=list[GarmentInfo])
def list_garments():
    """List available garment types with their pattern pieces."""
    return list(GARMENTS.values())


@router.get("/selections", response_model=list[GarmentSelectionResponse])
def list_selections(db: Session = Depends(get_db)):
    """List all selected garments with their adjustments."""
    rows = db.query(GarmentSelection).order_by(GarmentSelection.added_at).all()
    return [
        GarmentSelectionResponse(
            garment_name=r.garment_name,
            added_at=r.added_at,
            adjustments=r.adjustments,
        )
        for r in rows
    ]


@router.post("/selections/{garment_name}", response_model=GarmentSelectionResponse)
def add_selection(garment_name: str, db: Session = Depends(get_db)):
    """Add a garment to the user's selections."""
    existing = (
        db.query(GarmentSelection)
        .filter(GarmentSelection.garment_name == garment_name)
        .first()
    )
    if existing:
        return GarmentSelectionResponse(
            garment_name=existing.garment_name,
            added_at=existing.added_at,
            adjustments=existing.adjustments,
        )
    row = GarmentSelection(
        garment_name=garment_name,
        added_at=time.time(),
        adjustments={},
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return GarmentSelectionResponse(
        garment_name=row.garment_name,
        added_at=row.added_at,
        adjustments=row.adjustments,
    )


@router.delete("/selections/{garment_name}")
def remove_selection(garment_name: str, db: Session = Depends(get_db)):
    """Remove a garment from the user's selections."""
    row = (
        db.query(GarmentSelection)
        .filter(GarmentSelection.garment_name == garment_name)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Selection not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.put("/selections/{garment_name}/adjustments", response_model=GarmentSelectionResponse)
def update_adjustments(
    garment_name: str,
    body: AdjustmentsUpdate,
    db: Session = Depends(get_db),
):
    """Update per-piece adjustments for a selected garment."""
    row = (
        db.query(GarmentSelection)
        .filter(GarmentSelection.garment_name == garment_name)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Selection not found")
    row.adjustments = body.adjustments
    db.commit()
    db.refresh(row)
    return GarmentSelectionResponse(
        garment_name=row.garment_name,
        added_at=row.added_at,
        adjustments=row.adjustments,
    )
