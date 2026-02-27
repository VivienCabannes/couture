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

## Conventions

- Backend and frontend modules mirror each other (same section names: designer, shop, modelist, measurements, sewing, help)
- API client lives in `frontend/shared/src/api/` — never duplicate it per platform
- No `navigation/` folder — routing config lives at each app's root
- i18n: EN, FR, ES — all three languages must always be present when adding strings
- Tests mirror `app/` structure in `backend/tests/`
- Comment complex logic, but avoid obvious comments (e.g. `// increment i` is not helpful)
- Use descriptive variable and function names to reduce the need for comments
- Follow consistent code formatting (e.g. Prettier for frontend, Black for backend)
- Document every public function with a docstring explaining its purpose, parameters, and return value
- Use type annotations in Python and TypeScript for better readability and maintainability
- Document every feature and page in `PAGES.md` with a clear description of its purpose, user flow, and any important design considerations
