# Feature Plan: Local Playwright E2E Suite

## Status

Approved by the user on 2026-09-29. Implemented and verified locally on 2026-09-29.

## Outcome

Run repeatable browser tests against the real SmartPoints UI and an isolated local Supabase stack. The tests cover signup and family setup, daily points actions, shared-parent access, and a mobile viewport without touching hosted Supabase data.

## Facts, assumptions, and open questions

- Facts:
  - The repository currently has Vitest unit/contract tests and Supabase pgTAP tests, but no browser E2E framework or `e2e` script.
  - The normal `scripts/development-start.sh` applies migrations to the linked hosted Supabase project before starting Next.js, so it is unsuitable for the E2E web server.
  - The installed Supabase CLI supports `supabase start --workdir <path>` for a separate project directory.
  - Local Supabase Auth has email confirmations disabled. The UI signup action redirects to sign-in, so local E2E can sign in without a live email inbox.
  - The invitation UI creates a one-time URL and a second authenticated parent accepts it using that link.
- Assumptions:
  - Use unique `example.test` email addresses and generated passwords for each run.
  - Start and reset only the dedicated E2E Supabase project. Refuse to run if the configured Supabase URL is not loopback.
  - Use the current app UI for user and invitation setup; do not rely on production or hosted data, service-role credentials, or external email.
- Open questions: none.

## Scope

### Included

- Add Playwright and a local `npm run e2e` command.
- Start an isolated Supabase project with a dedicated `project_id`, ports, migrations, local Auth settings, and test-only data.
- Start the Next.js E2E server with the isolated Supabase URL and publishable key, without invoking the linked-project development launcher.
- Browser flow for signup, starter-template onboarding, completing and undoing a task, redeeming and undoing a reward, and checking the resulting point state.
- Browser flow with two parent accounts: create an invitation, sign in as the invited parent, accept the invitation, and verify shared-child access remains scoped to that child while the invited parent can create a separate child profile.
- Test a timed reward and Star Trail in the UI as part of the daily workspace path.
- A mobile viewport smoke test for task and reward interactions at a narrow phone-sized viewport.
- Playwright failure screenshots and traces saved to ignored local output directories.

### Excluded

- Production, hosted-development, preview, or real-email testing.
- A CI workflow in this first iteration; the suite runs locally by command.
- Real-device iOS/PWA testing, Safari/WebKit coverage, visual snapshot baselines, load testing, and third-party test services.
- Database authorization replacement: existing pgTAP tests remain the direct RLS/RPC authorization matrix.

## Acceptance criteria

- [x] `npm run e2e` starts and stops the dedicated local stack and Next.js server without using linked Supabase credentials or data.
- [x] Startup validates the target Supabase URL is loopback and fails before launching tests if the target is hosted or otherwise unexpected.
- [x] E2E setup applies tracked migrations to the isolated project and uses local Auth with email confirmation disabled.
- [x] A browser-created parent can create a child from the optional starter template and see its copied tasks and rewards.
- [x] The UI can complete a task, show the expected full point value and star progress, then Undo and restore the previous point state.
- [x] The UI can create/redeem a timed reward, show its countdown, and undo a redemption. Timer-limit feedback is covered by a deterministic UI case.
- [x] Two separate browser contexts can complete invitation and acceptance. The invited parent sees the shared child and a separately created child without exposing either parent’s unrelated data to the other.
- [x] The narrow mobile viewport can operate a task and reward without layout overflow or blocked controls.
- [x] Tests use role/name locators and retrying Playwright assertions instead of fixed sleeps; failures retain actionable local traces/screenshots.
- [x] E2E artifacts and generated local environment/config files are ignored and use only disposable synthetic test identities.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | Isolated local Playwright harness | Safe local-only startup, dedicated Supabase project, migrations, Next server, one `npm run e2e` entry point, and failure artifacts. | package scripts/dependencies, Supabase CLI, local test configuration, Next server lifecycle. |
| F2 | Signup, onboarding, and daily points journey | A new parent opts into the starter template; task completion/Undo and reward redemption/Undo produce the expected UI state, including timer and Star Trail signals. | Auth UI, family onboarding, task/reward UI, timers, achievements. |
| F3 | Shared-parent browser journey | Two contexts create/accept a share invitation and verify shared-child and independent-child visibility through the UI. | Auth, invitation UI, child selection, family-scoped reads. |
| F4 | Mobile viewport smoke | A narrow phone-sized viewport can complete a task and redeem a reward with usable controls and no horizontal overflow. | Responsive workspace UI and Playwright viewport configuration. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | F2, F3, F4 | — | Owns package/config and isolated-stack lifecycle; other work must use its finalized fixtures and server contract. | `npm run e2e` safely starts, runs, and stops the isolated test environment. |
| F2 | F1 | F4, release regression runs | — | Uses the common account and app fixtures. | Browser assertions cover onboarding, points, Undo, timer, and Star Trail. |
| F3 | F1 | Release regression runs | — | Uses two isolated browser contexts and the shared auth/invitation fixtures. | Both parents can complete the invite flow and observe only their authorized children. |
| F4 | F1, F2 | Release regression runs | — | Reuses the tested daily action flow at the mobile viewport. | Phone-sized viewport assertions pass for task and reward interactions and layout. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Browser framework | Playwright or Cypress? | Playwright fits this Next.js app and supports desktop/mobile emulation and failure traces; it adds browser binaries and a maintained test dependency. | Playwright. | Add Playwright as the browser E2E runner. | Resolved |
| Backend isolation | Dedicated E2E stack or reuse everyday local Supabase? | A separate project ID and ports protect existing local data and avoid the linked hosted migration launcher; it uses additional Docker resources. | Dedicated isolated local stack. | Use a separate Supabase workdir/config and never target hosted Supabase. | Resolved |
| Product coverage | Include shared-parent acceptance in the initial suite? | Yes covers an important multi-user journey; two authenticated contexts make it slower and more involved. | Include it. | Add an invitation creation and acceptance browser flow for two parent accounts. | Resolved |
| Mobile coverage | Include a mobile viewport smoke test? | Yes covers phone-sized layout and actions in repeatable desktop browser automation; it does not replace a real iPhone test. | Include it. | Add a narrow phone viewport task/reward smoke test. | Resolved |
| CI scope | Add CI now or keep the first suite local? | Local command first fits the repo’s lack of an existing CI workflow and keeps the first Docker setup easy to debug; tests will not run automatically on pull requests. | Local command only for now. | Exclude CI workflow; document the command and prerequisites. | Resolved |
| Browser matrix | Chromium only or include WebKit? | Chromium keeps the first Docker-backed suite fast and simple; Safari-specific regressions will not be caught. | Chromium only. | Use Chromium for desktop coverage and the mobile viewport emulation. | Resolved |

## Contracts and boundaries

- **Browser runner:** add `@playwright/test`, a Playwright config, and an `npm run e2e` script. Keep browser tests outside Vitest’s existing `tests/**/*.test.ts` discovery.
- **Supabase:** create/use a separate workdir with a distinct project ID and port set. Only the E2E project may be reset. Use tracked migrations and local Auth configuration with email confirmations disabled. Never call the linked migration launcher.
- **Next.js:** launch a dedicated test server directly with environment values obtained from the local stack. Add an explicit loopback destination guard before starting it. Do not use a service-role key.
- **Test identities:** create unique synthetic email identities in the browser. Do not send real email or include personal data in snapshots, traces, or fixtures.
- **Isolation:** each test starts from the isolated E2E database state. Invitation tests use two independent browser contexts. No production/hosted database rows are read or modified.
- **Artifacts:** write Playwright traces and screenshots to local ignored paths on failure; do not upload them to a third party. Traces may contain disposable local test sessions.
- **Authorization:** browser tests exercise user-visible family selection and sharing; pgTAP remains the authoritative low-level RLS and RPC isolation test.
- **Cost/privacy:** no paid provider, external account, or third-party test service is introduced. No AI boundary.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add the Playwright dependency, safe isolated Supabase setup/teardown, loopback guard, test server configuration, `npm run e2e`, and ignored outputs. | `package.json`, lockfile, `.gitignore`, `playwright.config.ts`, `scripts/e2e/*`, isolated Supabase config generation. | Prove the runner uses the isolated project and refuses a non-loopback URL; run one smoke test. |
| 2 | F2 | Add the signup/onboarding and daily points journey with deterministic task/reward setup, Undo, timed reward, and Star Trail assertions. | `e2e/onboarding-and-points.spec.ts`, shared test fixtures. | Run against isolated Supabase; verify full points and state transitions through rendered UI. |
| 3 | F3 | Add two-context invitation creation and acceptance plus family-scoped profile visibility checks. | `e2e/shared-parent.spec.ts`, auth/context fixture. | Run repeatedly with unique emails and no real email delivery. |
| 4 | F4 | Add the mobile viewport smoke test for task and reward actions. | `e2e/mobile-workspace.spec.ts`, Playwright projects/context config. | Run on phone-sized viewport and verify no horizontal overflow and working task/reward controls. |
| 5 | F1–F4 | Document prerequisites and test commands, then run the complete quality gate. | E2E README or plan documentation, implementation status. | `npm run e2e`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and local Supabase database tests. |

## Risks and rollback

- **Remote data mutation:** a configuration mistake could point browser tests at hosted Supabase. Fail closed unless the target URL is loopback; run the web server only with the isolated test values.
- **Local data loss:** database reset is restricted to the dedicated E2E project ID/workdir, never the developer’s regular stack.
- **Flaky tests:** use unique synthetic identities, isolated database state, accessible role/name locators, Playwright auto-waiting, and no fixed delays.
- **Email verification:** local Auth confirmations are disabled; use the browser sign-in flow after signup without opening a real inbox.
- **Invitation timing:** create the invitation through the UI and pass its returned local URL between the two contexts; no external mail dependency.
- **Rollback:** remove the E2E dependencies, config, scripts, tests, and ignore entries. The isolated project can be stopped independently; app runtime code and hosted data are unaffected.

## Verification

- `npm run e2e`: pgTAP passed on the isolated local database and all three Chromium cases passed.
- `npm test`: 32 files, 78 tests passed. `npm run lint`, `npm run typecheck`, and a local-target `npm run build` passed.
- See `task-01-result.md` through `task-04-result.md` and `e2e/README.md`.
