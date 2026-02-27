# Couture

Computer-assisted sewing pattern drafting.

Couture provides computer assistance to modelists and hobbyists. Rather than calculating ease, dart placement, and curve radii by hand, Couture mathematically generates and adjusts patterns based on user measurements — making the engineering of clothing accessible, precise, and automated.

## Platforms

- **Web app** — React + Vite
- **Desktop app** — Tauri (wraps the web app)
- **Mobile / tablet app** — Expo / React Native

## Tech stack

| Layer    | Technology                          | Notes                                                        |
|----------|-------------------------------------|--------------------------------------------------------------|
| Backend  | Python                              | Chosen for rapid prototyping; may migrate to a compiled language for performance |
| Frontend | TypeScript, React, Vite             |                                                              |
| Mobile   | TypeScript, React Native, Expo      |                                                              |
| Desktop  | Tauri                               | Wraps the web frontend                                       |

## Project structure

```
backend/
  app/
    core/           # Cross-page domain entities (measurements, designs)
    designer/       # Designer Studio logic
    measurements/   # Measurement management
    modelist/       # Pattern geometry and editing
    shop/           # Pattern browsing and search
    sewing/         # Assembly instructions
    help/           # Help and glossary
  tests/            # Test suite (mirrors app/ structure)
  cli/              # CLI debugging tools
frontend/
  web/src/
    features/       # One folder per page (home, designer, shop, ...)
    components/     # Shared UI primitives
    hooks/          # Shared React hooks
    styles/         # Global styles
  mobile/src/
    features/       # One folder per page (mirrors web)
    components/     # Mobile UI primitives
    hooks/          # Mobile hooks
    theme/          # Mobile theme
  shared/src/
    api/            # API client (used by both web and mobile)
    types/          # Shared TypeScript types
    hooks/          # Platform-agnostic hooks
    i18n/           # Internationalization (EN, FR, ES)
docs/               # Project documentation
old/                # Legacy codebase (read-only reference)
```

## Getting started

### Web app

```bash
cd frontend/web
npm install
npm run dev
```

This starts the Vite dev server (defaults to `http://localhost:5173`).

To create a production build:

```bash
npm run build    # type-check + build
npm run preview  # preview the production build locally
```

## Documentation

- [Vision and Roadmap](docs/VISION.md)
- [Page Descriptions](docs/PAGES.md)
- [Front Page Design](docs/FRONT_PAGE_DESIGN.md)

## License

TBD
