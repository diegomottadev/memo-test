#!/usr/bin/env bash
#
# Publishes the app to GitHub Pages (branch gh-pages).
#
#   npm run deploy               build and publish
#   DRY_RUN=1 npm run deploy     build and show what would be published, without commit or push
#
# Environment variables:
#   BASE_URL        Path of the site (default: /<repo name>/).
#   DEPLOY_API_URL  GraphQL URL for the published app (default: empty = sample data).
#                   If it is set but the server does not answer, the app switches
#                   to the sample data by itself.
#   DEPLOY_BRANCH   Target branch (default: gh-pages).
#   DEPLOY_REMOTE   Git remote (default: origin).
#
# The commit uses the local git user; the push never uses --force.

set -euo pipefail

cd "$(dirname "$0")/.."

REMOTE="${DEPLOY_REMOTE:-origin}"
BRANCH="${DEPLOY_BRANCH:-gh-pages}"
DRY_RUN="${DRY_RUN:-0}"
REPO_NAME="$(basename -s .git "$(git config --get "remote.$REMOTE.url")")"
BASE_URL="${BASE_URL:-/$REPO_NAME/}"
SOURCE_REF="$(git rev-parse --short HEAD)"
if [ -n "$(git status --porcelain)" ]; then
  SOURCE_REF="$SOURCE_REF-dirty"
fi

echo "==> Building for $BASE_URL (API: ${DEPLOY_API_URL:-sample data})"
# VITE_API_URL is set explicitly so the build never takes the URL from .env.local.
VITE_API_URL="${DEPLOY_API_URL:-}" BASE_URL="$BASE_URL" npm run build

WORKTREE="$(mktemp -d)"
cleanup() {
  git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || rm -rf "$WORKTREE"
}
trap cleanup EXIT

echo "==> Preparing branch $BRANCH in a temporary worktree"
if git ls-remote --exit-code --heads "$REMOTE" "$BRANCH" >/dev/null 2>&1; then
  git fetch --quiet "$REMOTE" "$BRANCH"
  # Start from the published branch, so the new commit goes on top of it (no force push).
  git worktree add --quiet -B "$BRANCH" "$WORKTREE" "$REMOTE/$BRANCH"
elif git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  # Local branch from a deploy whose push failed: continue from it.
  git worktree add --quiet "$WORKTREE" "$BRANCH"
else
  # First deploy: a branch with no history, only the built site.
  git worktree add --quiet --orphan -b "$BRANCH" "$WORKTREE"
fi

# Replace the old site with the new build; keep only the worktree's .git file.
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. "$WORKTREE"/
# Without .nojekyll, Pages runs Jekyll and hides files and folders that start with "_".
touch "$WORKTREE/.nojekyll"

git -C "$WORKTREE" add --all

if git -C "$WORKTREE" diff --cached --quiet; then
  echo "==> Nothing changed since the last deploy."
  exit 0
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "==> DRY_RUN: these files would be published to $REMOTE/$BRANCH:"
  git -C "$WORKTREE" diff --cached --stat
  echo "==> DRY_RUN: no commit and no push were made."
  exit 0
fi

git -C "$WORKTREE" commit --quiet -m "Deploy $SOURCE_REF"
git -C "$WORKTREE" push "$REMOTE" "$BRANCH"
echo "==> Published. Site: https://$(git config --get "remote.$REMOTE.url" | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#').github.io$BASE_URL"
