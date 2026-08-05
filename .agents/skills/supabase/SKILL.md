---
name: supabase
description: Use for any Supabase Database, Auth, RLS, Storage, Edge Function, migration, client-library, or security task.
metadata:
  author: supabase
  version: "0.1.2"
---

# Supabase

## Required first steps

1. Fetch the current Supabase changelog and check relevant breaking changes.
2. Read current official documentation for the specific product or API before implementation.
3. Verify every implemented database or auth fix with a query or authorized flow; do not rely on code inspection alone.
4. After two or three failed approaches, stop retrying blindly and inspect errors, logs, and assumptions.

## Data API and RLS

- Data API exposure and RLS are separate. When a SQL-created table is inaccessible, verify both exposure/grants and RLS.
- Enable RLS on every table in exposed schemas. Policies must match real ownership/membership; `TO authenticated` alone is not authorization.
- `UPDATE` requires a usable `SELECT` policy and both `USING` and `WITH CHECK` where ownership must not change.
- Do not use editable `user_metadata` claims for authorization. Use server-controlled app metadata or relational authorization data.
- Views can bypass RLS; use `security_invoker` where supported or restrict access explicitly.

## Keys and privileged functions

- Never expose service-role or secret keys in browser code. `NEXT_PUBLIC_*` values are public in Next.js.
- Do not use `SECURITY DEFINER` merely to bypass an authorization problem. If genuinely required, use an explicit search path, caller checks, minimal grants, and revoke public execution.

## CLI and migration rules

- Discover Supabase CLI commands with `--help`; do not guess flags.
- Choose declarative versus imperative schema workflow first.
- For imperative migrations, iterate safely, then create and review a clean migration.
- Run advisors for schema or security-sensitive changes when available.
- Apply migrations with a tracked, idempotent runner and verify function, policy, and schema state afterward.
- Before changing save/delete flows, inspect foreign keys and cascade behavior.

## Auth and security reminders

- Deleting a user does not automatically invalidate issued access tokens; revoke sessions when required.
- JWT authorization claims can be stale until token refresh.
- Storage upsert needs the appropriate insert, select, and update policies.
- Pin dependencies and commit lockfiles.
