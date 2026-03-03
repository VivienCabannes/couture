"""SQLAlchemy ORM models for persistent storage."""

from sqlalchemy import Column, Float, Integer, JSON, String

from database import Base


class SavedMeasurements(Base):
    """Persisted user measurements (singleton row, id=1)."""

    __tablename__ = "measurements"

    id: int = Column(Integer, primary_key=True, default=1)
    size: int = Column(Integer, default=38)
    values: dict = Column(JSON)
    idk: dict = Column(JSON)


class GarmentSelection(Base):
    """A garment the user has selected from the Pattern Rack."""

    __tablename__ = "garment_selections"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    garment_name: str = Column(String, unique=True, nullable=False)
    added_at: float = Column(Float, nullable=False)
    adjustments: dict = Column(JSON, default=dict)
