# F2 — Magic Kingdom quest card result

## Outcome

The child dashboard now presents Star Trail as a bright Magic Kingdom quest card. It shows the current title, a large star pouch, an encouraging next-step message, and a five-stop quest path. The existing Achievements page remains the home for badge history.

The Workspace menu uses an eye-with-slash icon for Hide Star Trail and an eye icon for Show Star Trail, matching the other menu actions.

Each task point contributes one star. The milestones remain 5, 10, 20, and 35 stars.

## Test-first record

- Red: `npm test -- --run tests/star-trail-dashboard.test.ts` failed because the original card lacked the required quest-card content.
- Green: `npm test -- --run tests/star-trail-dashboard.test.ts tests/star-trail-ledger.test.ts` passed (2 files, 2 tests).

## Verification

- `./node_modules/.bin/supabase test db --local` — passed: 8 files, 51 assertions.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed: 30 files, 74 tests.
- `npm run build` — passed.
- `npm test -- --run tests/star-trail-visibility.test.ts` — passed after the menu icon addition.
- `npm run typecheck` — passed after the menu icon addition.
