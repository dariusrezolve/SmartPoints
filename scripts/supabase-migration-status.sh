#!/usr/bin/env bash

# Compare local migration files with the linked Supabase project's history.
set -euo pipefail

SUPABASE_CLI="./node_modules/.bin/supabase"

if [[ ! -x "$SUPABASE_CLI" ]]; then
  echo "Missing pinned Supabase CLI. Run 'npm install' before checking migrations." >&2
  exit 1
fi

if [[ ! -f supabase/config.toml ]]; then
  echo "Missing supabase/config.toml. Run 'supabase init' before checking migrations." >&2
  exit 1
fi

# Keep any globally forced Docker platform from affecting the project CLI.
env -u DOCKER_DEFAULT_PLATFORM "$SUPABASE_CLI" migration list --linked
