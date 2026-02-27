# Data Flow: Measurements, Patterns, Modifications

## Context

The data flow architecture described below has been implemented. The backend (FastAPI + pattern generation) and frontend pages (Pattern Rack, Modelist, Measurements) are connected through Zustand stores that sync state across pages and persist to the backend. Measurements flow from the Measurements page to the Modelist, garment selections are tracked across the Pattern Rack and Modelist, and state is restored on reload.

The Zustand stores are **vanilla** (platform-agnostic) and live in `frontend/shared/src/stores/`. React hook wrappers for the web app are in `frontend/web/src/stores/`.

## Three Persistent Objects

1. **Measurements** — entered on the Measurements page, stored in the backend, available across all pages
2. **Selected garments** — chosen in the Pattern Rack, persisted so the Modelist knows which garments the user is working with
3. **Pattern modifications** — per-piece adjustments (ease, controls, stretch) made in the Modelist, preserved across sessions

## Architecture

```
Measurements page ──→ Zustand store ──→ Modelist page
                          ↕                    ↕
Pattern Rack ────────→ Zustand store     usePatternForm
                          ↕                    ↕
                     API client ←─────── API client
                          ↕                    ↕
                   FastAPI backend ──→ SQLite database
```

### Backend additions
- `GET/PUT /api/measurements` — save/load user's custom measurements
- `GET/POST/DELETE /api/shop/selections` — track which garments are selected
- `PUT /api/shop/selections/:name/adjustments` — save per-piece adjustments

### Frontend: Zustand stores
- **Measurements store** — replaces the local `useMeasurements()` hook. Syncs with the backend. Available to both the Measurements page and the Modelist.
- **Selections store** — tracks which garments the user has selected. Available to both the Shop and the Modelist.

### Key data flow
1. User enters measurements on Measurements page → saved to backend via Zustand store
2. User selects a garment in the Pattern Rack → saved to backend via Zustand store
3. User opens the Modelist → measurements are pre-loaded from the store, garment pieces are shown in tabs
4. User adjusts controls and generates patterns → adjustments saved to backend
5. On reload or navigation: all state is restored from the backend
