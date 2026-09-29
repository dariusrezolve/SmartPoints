# F1 — Isolated local Playwright harness

Completed 2026-09-29. `npm run e2e` creates an unlinked `SmartPointsE2E` workdir, checks its project ID, local ports, Auth URL, and returned loopback API URL, copies tracked migrations and pgTAP tests, resets only that local database, builds a separate Next.js output, and stops the stack afterward. Playwright artifacts are ignored locally. The safety test was written first and failed before the guard existed; it now passes.

Verification: focused safety tests passed; full `npm run e2e` later passed with pgTAP and three Chromium cases. No hosted Supabase endpoint or linked migration command was used.
