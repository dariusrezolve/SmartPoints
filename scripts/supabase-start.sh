#!/usr/bin/env bash

# Start SmartPoints' local Supabase stack with the project-pinned CLI.
# The Docker platform override is deliberately scoped to this command.
set -euo pipefail

SUPABASE_CLI="./node_modules/.bin/supabase"

if [[ ! -x "$SUPABASE_CLI" ]]; then
  echo "Missing pinned Supabase CLI. Run 'npm install' before starting the local stack." >&2
  exit 1
fi

if [[ ! -f supabase/config.toml ]]; then
  echo "Missing supabase/config.toml. Run 'npm run db:init' before starting the local stack." >&2
  exit 1
fi

env -u DOCKER_DEFAULT_PLATFORM "$SUPABASE_CLI" start
