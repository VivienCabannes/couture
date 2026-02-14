import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import measurements, patterns

app = FastAPI(title="Patterns API", version="0.1.0")

# CORS: always allow local dev origins; add production origins via CORS_ORIGINS env var
origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
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

app.include_router(measurements.router)
app.include_router(patterns.router)


@app.get("/")
def root():
    return {"message": "Patterns API", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
