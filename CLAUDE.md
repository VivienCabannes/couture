# Couture — AI Assistant Guide

Couture is a computer-assisted sewing pattern drafting application (web, desktop, mobile).

## Tech stack

- **Backend:** Python (prototyping phase — may migrate to a compiled language for performance)
- **Frontend:** TypeScript / React / Vite
- **Mobile:** TypeScript / React Native / Expo
- **Desktop:** Tauri (wraps the web frontend)

## Directory structure

### Backend (`backend/`)

- `app/` contains one module per page/section: `designer/`, `shop/`, `modelist/`, `measurements/`, `sewing/`, `help/`
- `core/` is **strictly** for cross-page domain entities — measurements, designs, and shared data models
- Page-specific code (pattern algorithms, rendering logic, geometry) stays in its own module — do NOT put it in `core/`
- `tests/` mirrors the `app/` structure (e.g. `tests/test_modelist.py` for `app/modelist/`)
- `cli/` contains CLI debugging tools

### Frontend (`frontend/`)

- `web/src/features/` has one folder per page: `home/`, `designer/`, `shop/`, `modelist/`, `measurements/`, `sewing/`, `help/`
- `web/src/components/` is for UI primitives used by 2+ features — do NOT put feature-specific components here
- `mobile/src/features/` mirrors the web features structure
- `shared/` is platform-agnostic code — no DOM APIs, no React Native APIs
  - `shared/src/api/` — API client (used by both web and mobile, never duplicated per platform)
  - `shared/src/types/` — shared TypeScript types
  - `shared/src/i18n/` — internationalization strings

### Docs (`docs/`)

- `VISION.md` — project mission and roadmap
- `PAGES.md` — page descriptions and layouts
- `FRONT_PAGE_DESIGN.md` — front page design spec

### Legacy (`old/`)

- Contains the previous codebase. **Do not modify anything in `old/`.**

## Conventions

- Backend and frontend modules mirror each other (same section names: designer, shop, modelist, measurements, sewing, help)
- API client lives in `frontend/shared/src/api/` — never duplicate it per platform
- No `navigation/` folder — routing config lives at each app's root
- i18n: EN, FR, ES — all three languages must always be present when adding strings
- Tests mirror `app/` structure in `backend/tests/`
