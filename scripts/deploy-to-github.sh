#!/usr/bin/env bash
# Create GitHub repo 2d3d and push. Usage: GITHUB_PERSONAL_ACCESS_TOKEN=xxx ./scripts/deploy-to-github.sh
set -e
cd "$(dirname "$0")/.."
TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "Set GITHUB_PERSONAL_ACCESS_TOKEN and run again."
  exit 1
fi
USER=$(curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user | grep -o '"login": *"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$USER" ]; then
  echo "Failed to get GitHub user (check token)."
  exit 1
fi
echo "Creating repo as $USER..."
RESP=$(curl -s -w "\n%{http_code}" -X POST -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos -d '{"name":"2d3d","private":false,"description":"2D/3D backends and frontends"}')
HTTP_CODE=$(echo "$RESP" | tail -1)
if [ "$HTTP_CODE" != "201" ] && [ "$HTTP_CODE" != "422" ]; then
  echo "Create repo failed (HTTP $HTTP_CODE)."
  exit 1
fi
if git remote get-url origin 2>/dev/null; then
  git remote remove origin
fi
git remote add origin "https://github.com/$USER/2d3d.git"
# Push using token in URL so Cursor/git don't prompt (which can 401)
PUSH_URL="https://${USER}:${TOKEN}@github.com/${USER}/2d3d.git"
git push "$PUSH_URL" main
git fetch "$PUSH_URL" main:refs/remotes/origin/main
git branch --set-upstream-to=origin/main main
echo "Done: https://github.com/$USER/2d3d"
