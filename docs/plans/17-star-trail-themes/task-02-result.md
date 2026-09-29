# F2 result — Preserve themed badge history

Completed locally on 2026-09-29. Existing awards receive the Magic Kingdom theme default without changing their stored badge names. New awards snapshot the child's selected theme and the matching badge name within the existing award transaction. Theme switches leave prior names and dates intact. The Achievements page shows each award's stored theme and name. The 5/10/20/35-star thresholds, +2/+3/+5/+8 bonuses, weekly identity, and Undo logic remain the same.

TDD: `supabase/tests/star_trail_themes.test.sql` made the isolated database test fail before the themed award migration. After implementation, pgTAP passed checks for Hogwarts badges, a midweek switch to Middle-earth, unchanged prior names, unchanged bonus amounts, invalid theme rejection, and child authorization. The existing 10-point completion and Undo ledger test also passed.

Verification: `npm run e2e` passed (including local pgTAP and 4 Chromium tests), `npm run lint` passed, `npm run typecheck` passed, `npm test` passed (80 tests), `npm run build` passed, and `git diff --check` passed. No hosted database was contacted for testing. No push or deployment.
