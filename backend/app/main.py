"""FastAPI application for the Couture pattern drafting backend."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.shop.router import router as shop_router
from app.modelist.router import router as modelist_router
from app.measurements.router import router as measurements_router

app = FastAPI(title="Couture API", version="0.1.0")

# CORS: always allow local dev origins; add production origins via CORS_ORIGINS env var
origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    "http://localhost:8081",
]
cors_env = os.environ.get("CORS_ORIGINS", "")
if cors_env:
    origins.extend(o.strip() for o in cors_env.split(",") if o.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shop_router)
app.include_router(modelist_router)
app.include_router(measurements_router)


@app.get("/")
def root():
    """Root endpoint returning API info."""
    return {"message": "Couture API", "version": "0.1.0"}


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}
