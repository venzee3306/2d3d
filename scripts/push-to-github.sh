#!/usr/bin/env bash
# Push current branch to GitHub using token (avoids Cursor credential 401).
# Usage: GITHUB_PERSONAL_ACCESS_TOKEN=xxx ./scripts/push-to-github.sh
set -e
cd "$(dirname "$0")/.."
TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "Set GITHUB_PERSONAL_ACCESS_TOKEN and run again."
  exit 1
fi
BRANCH=$(git rev-parse --abbrev-ref HEAD)
USER=$(curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user | grep -o '"login": *"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$USER" ]; then
  echo "Failed to get GitHub user (check token)."
  exit 1
fi
PUSH_URL="https://${USER}:${TOKEN}@github.com/${USER}/2d3d.git"
git push "$PUSH_URL" "$BRANCH"
echo "Pushed $BRANCH to origin."
