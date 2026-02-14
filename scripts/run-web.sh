#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../web"
npm ci --silent
npm run dev
