#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() {
  echo ""
  echo "Shutting down..."
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID"
    wait "$BACKEND_PID" 2>/dev/null
  fi
}
trap cleanup EXIT INT TERM

# Start backend
cd "$ROOT_DIR/backend/python"
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""

# Start frontend (foreground — Ctrl+C stops everything via trap)
cd "$ROOT_DIR/frontend/web"
npx vite --port 5173
