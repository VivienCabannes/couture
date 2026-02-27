# Data Flow: Measurements, Patterns, Modifications

## Context

The backend (FastAPI + pattern generation) and frontend pages (Shop, Modelist, Measurements) are functional but disconnected. Each page manages its own state independently — measurements entered on the Measurements page don't flow to the Modelist, garment selections aren't tracked, and adjustments are lost on navigation.

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
