"""Garment discovery API — lists available garment types with their pieces."""

from fastapi import APIRouter

from app.schemas.shop import GarmentInfo, PieceInfo

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
