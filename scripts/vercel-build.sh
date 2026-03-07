#!/usr/bin/env bash
# Usage: bash scripts/vercel-build.sh <Useronboarding|Agentdashboard2d3d>
# Run from repo root. Requires submodules to be initialized (vercel.json installCommand).
set -e
APP_DIR="${1:?Usage: $0 Useronboarding|Agentdashboard2d3d}"
if [ ! -d "$APP_DIR" ]; then
  echo "Error: directory $APP_DIR not found. Run from repo root and ensure submodules are fetched."
  exit 1
fi
cd "$APP_DIR"
npm ci
npm run build
