#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
deployment_target="preview"

if [[ "${1:-}" == "--prod" ]]; then
  deployment_target="production"
elif [[ $# -gt 0 ]]; then
  echo "Usage: npm run deploy:vercel [-- --prod]" >&2
  exit 1
fi

cd "$repo_root"

if ! command -v git >/dev/null 2>&1; then
  echo "Deployment stopped: git is required to identify the source revision." >&2
  exit 1
fi

if ! npm exec -- vercel --version >/dev/null 2>&1; then
  echo "Deployment stopped: the Vercel CLI is unavailable. Run npm install first." >&2
  exit 1
fi

if [[ "${DEPLOY_MIGRATIONS:-0}" == "1" ]]; then
  echo "Applying pending database migrations before ${deployment_target} deployment."
  npm run db:migrate:apply
else
  echo "Database migrations are not being applied. Set DEPLOY_MIGRATIONS=1 to opt in."
fi

echo "Checking the application before ${deployment_target} deployment."
npm run typecheck
npm test
npm run build

revision="$(git rev-parse --short HEAD)"
echo "Deploying revision ${revision} to Vercel (${deployment_target})."

vercel_link="$repo_root/.vercel/project.json"
if [[ ! -f "$vercel_link" ]]; then
  echo "Deployment stopped: Vercel is not linked. Run 'npm exec -- vercel link' from the repository root first." >&2
  exit 1
fi

vercel_org_id="$(node -p "require(process.argv[1]).orgId" "$vercel_link")"
vercel_project_id="$(node -p "require(process.argv[1]).projectId" "$vercel_link")"

if [[ -z "$vercel_org_id" || -z "$vercel_project_id" ]]; then
  echo "Deployment stopped: the Vercel project link is incomplete." >&2
  exit 1
fi

if [[ "$deployment_target" == "production" ]]; then
  VERCEL_ORG_ID="$vercel_org_id" VERCEL_PROJECT_ID="$vercel_project_id" npm exec -- vercel deploy --prod
else
  VERCEL_ORG_ID="$vercel_org_id" VERCEL_PROJECT_ID="$vercel_project_id" npm exec -- vercel deploy
fi

echo "Vercel deployment completed."
