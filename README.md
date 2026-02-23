# Patterns

Sewing pattern generation platform — corset/bodice block, set-in sleeve, and baby dress.

## Backend

- **Python >= 3.11**, FastAPI, Uvicorn
- **NumPy** for geometry computations, **fpdf2** for PDF rendering
- Custom SVG renderer (no matplotlib dependency)
- API routes: pattern generation (`/patterns`), measurement lookup (`/measurements`), health check (`/health`)

## Web frontend

- React 19 + TypeScript, built with Vite
- Tailwind CSS for styling, React Router for navigation
- Served via Nginx in production (Docker) or Render static site

## Mobile frontend

- Expo SDK 54 / React Native 0.81
- `react-native-svg` for pattern display, `expo-sharing` for exporting
- React Navigation for screen flow
- Runs on iOS, Android, and web

## Running the project

### Docker Compose (full stack locally)

```
docker-compose up
```

Backend at `localhost:8000`, web at `localhost:3000`.

### Render.com (production)

Already configured via `render.yaml` — auto-deploys on push. Two services:

- **patterns-api** — Docker web service (FastAPI)
- **patterns-web** — static site (Vite build, CDN-backed)

### Manual / dev mode

Backend:

```
cd backend
pip install .
uvicorn app.main:app --reload
```

Web:

```
cd web
npm ci
npm run dev
```

Mobile:

```
cd mobile
npm ci
npx expo start
```

## CLI usage

Run patterns directly from the terminal without starting the backend or any frontend:

```
python cli/corset.py
python cli/sleeve.py
python cli/baby_dress.py
```

Output (SVG and PDF) goes to `output/`.

Edit the variables at the top of each script to customize measurements, stretch factors, and control parameters. For example, `cli/corset.py` lets you choose between named measurements, standard sizing, or fully custom values, and set `STRETCH_HORIZONTAL` / `STRETCH_VERTICAL`. `cli/sleeve.py` takes a `SleeveMeasurements` object, and `cli/baby_dress.py` takes a `Params` object with dimensions like total length, chest width, and seam allowances.

## Vision & Roadmap

See [docs/VISION.md](docs/VISION.md) for the project's mission, design philosophy, and roadmap.

## Project structure

```
backend/    FastAPI application and pattern logic
web/        React + Vite frontend
mobile/     Expo / React Native app
cli/        Standalone scripts (no server needed)
output/     Generated SVG and PDF files
```
