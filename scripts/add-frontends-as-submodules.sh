#!/usr/bin/env bash
# Convert Agentdashboard2d3d and Useronboarding from regular folders to Git submodules.
# Prerequisite: Repos https://github.com/venzee3306/Agentdashboard2d3d and
#   https://github.com/venzee3306/Useronboarding must exist and have the desired code.
#   If they are empty, push the current folder contents to those repos first.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DASHBOARD_URL="git@github.com:venzee3306/Agentdashboard2d3d.git"
USER_URL="git@github.com:venzee3306/Useronboarding.git"

echo "Removing Agentdashboard2d3d and Useronboarding from this repo (they will become submodules)..."

# Remove from index and working tree so we can add as submodules
git rm -rf --cached Agentdashboard2d3d 2>/dev/null || true
git rm -rf --cached Useronboarding 2>/dev/null || true
rm -rf Agentdashboard2d3d Useronboarding

echo "Adding submodules..."
git submodule add "$DASHBOARD_URL" Agentdashboard2d3d
git submodule add "$USER_URL" Useronboarding

echo "Done. Commit with: git add .gitmodules Agentdashboard2d3d Useronboarding && git commit -m 'Add Agentdashboard2d3d and Useronboarding as submodules'"
echo "Clone/update later with: git submodule update --init --recursive"
