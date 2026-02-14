#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../mobile"
npm ci --silent
npx expo start
