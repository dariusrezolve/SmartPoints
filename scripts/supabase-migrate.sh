#!/usr/bin/env bash

# Apply only tracked Supabase migrations. This script never resets a database
# and never passes database credentials on the command line.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/supabase-migrate.sh local
  bash scripts/supabase-migrate.sh linked [--apply]

Commands:
  local             Apply pending migrations to the local Supabase stack.
  linked            Show a dry run for the linked remote project (default).
  linked --apply    Apply pending migrations to the linked remote project.

Prerequisites:
  - Install and authenticate the Supabase CLI.
  - Run `supabase init` and, for linked mode, `supabase link`.
  - Keep credentials in the CLI credential store or untracked environment files.
EOF
}

case "${1:-}" in
  -h|--help|help|"")
    usage
    exit 0
    ;;
esac

SUPABASE_CLI="./node_modules/.bin/supabase"

if [[ ! -x "$SUPABASE_CLI" ]]; then
  echo "Missing pinned Supabase CLI. Run 'npm install' before running migrations." >&2
  exit 1
fi

run_supabase() {
  # A globally forced Docker platform can conflict with the image platform
  # selected by the Supabase CLI on Apple Silicon. Keep this scoped to this app.
  env -u DOCKER_DEFAULT_PLATFORM "$SUPABASE_CLI" "$@"
}

if [[ ! -f supabase/config.toml ]]; then
  echo "Missing supabase/config.toml. Run 'supabase init' before running migrations." >&2
  exit 1
fi

case "${1:-}" in
  local)
    if [[ $# -ne 1 ]]; then
      usage >&2
      exit 2
    fi
    run_supabase db push --local
    ;;
  linked)
    if [[ $# -gt 2 || ( $# -eq 2 && "${2:-}" != "--apply" ) ]]; then
      usage >&2
      exit 2
    fi
    run_supabase migration list --linked
    if [[ "${2:-}" == "--apply" ]]; then
      run_supabase db push --linked
    else
      run_supabase db push --linked --dry-run
      echo "Dry run only. Re-run with 'linked --apply' to apply pending migrations."
    fi
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
