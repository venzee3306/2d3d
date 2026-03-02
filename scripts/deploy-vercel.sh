#!/usr/bin/env bash
# Deploy both frontends to Vercel. Run once: vercel login (or set VERCEL_TOKEN).
# Usage: ./scripts/deploy-vercel.sh   or   VERCEL_TOKEN=xxx ./scripts/deploy-vercel.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
VERCEL_CMD="npx vercel deploy --yes --prod"
if [ -n "${VERCEL_TOKEN:-}" ]; then
  VERCEL_CMD="$VERCEL_CMD --token $VERCEL_TOKEN"
fi
echo "Deploying User Onboarding..."
cd "$ROOT/Useronboarding"
$VERCEL_CMD --name useronboarding
echo ""
echo "Deploying Agent Dashboard..."
cd "$ROOT/Agentdashboard2d3d"
$VERCEL_CMD --name agentdashboard2d3d
echo ""
echo "Done. Set the returned URLs in Render CORS_ORIGINS and as VITE_*_API_URL if not already."
