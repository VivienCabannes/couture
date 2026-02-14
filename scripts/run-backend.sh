#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../backend"
pip install -q .
uvicorn app.main:app --reload --host 0.0.0.0
