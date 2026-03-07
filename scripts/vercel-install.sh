#!/usr/bin/env bash
# Vercel install: fetch submodules (private repos need GITHUB_TOKEN in env).
# Fixes: "destination path already exists" and "could not read Username" for private submodules.
set -e

# Use token from env (Vercel: add GITHUB_TOKEN or GITHUB_REPO_CLONE_TOKEN with repo read access)
TOKEN="${GITHUB_TOKEN:-$GITHUB_REPO_CLONE_TOKEN}"
if [ -n "$TOKEN" ]; then
  git config --global url."https://${TOKEN}@github.com/".insteadOf "https://github.com/"
fi

# Remove submodule dirs left by Vercel's initial clone so git submodule update can clone into them
rm -rf Agentdashboard2d3d Useronboarding

git submodule update --init --recursive
