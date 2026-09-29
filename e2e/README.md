# Local browser tests

Install dependencies with `npm ci`, install Chromium once with `npx playwright install chromium`, and make sure Docker is running. Run `npm run e2e` from the repository root. Pass a spec path after `--` to run one case, for example `npm run e2e -- e2e/mobile-workspace.spec.ts`.

The command creates a temporary, unlinked Supabase project named `SmartPointsE2E` on ports 55321–55329, applies the tracked migrations, resets only that project's database, and runs the pgTAP tests. It then builds and starts Next.js on port 3100 with the E2E stack's public key. The runner rejects any non-loopback API URL or unexpected project/port configuration. It stops the E2E stack and server after the run. The normal local `SmartPoints` stack and hosted Supabase projects are outside this command's target.

Playwright runs Chromium with fresh synthetic accounts. Failures produce ignored local screenshots and traces under `test-results/`; inspect them locally and do not upload them because browser traces can include ephemeral test sessions. The test database is removed when the stack stops. The suite covers signup, starter-list onboarding, points and Undo, timed rewards and limits, shared-parent invitations, and a phone-sized viewport.
