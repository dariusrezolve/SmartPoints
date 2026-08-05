#!/usr/bin/env bash

# Keep the hosted development schema aligned with tracked migrations before
# starting the local Next.js process. The migration runner applies only pending
# migration files recorded by the linked Supabase project's history.
set -euo pipefail

bash scripts/supabase-migrate.sh linked --apply
exec ./node_modules/.bin/next dev "$@"
