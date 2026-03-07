#!/usr/bin/env bash
# Usage: bash scripts/vercel-build.sh [Useronboarding|Agentdashboard2d3d]
# Or set VERCEL_APP_DIR (used by vercel.json when two projects share one repo).
# Run from repo root. Requires submodules to be initialized (vercel.json installCommand).
set -e
APP_DIR="${1:-$VERCEL_APP_DIR}"
APP_DIR="${APP_DIR:-Useronboarding}"
if [ ! -d "$APP_DIR" ]; then
  echo "Error: directory $APP_DIR not found. Run from repo root and ensure submodules are fetched. Set VERCEL_APP_DIR or pass the app dir."
  exit 1
fi
cd "$APP_DIR"
# Use npm ci when lock file exists (reproducible); else npm install (submodules may not have package-lock.json)
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm run build
