# F1 result — Choose and preview a child's trail

Completed locally on 2026-09-29. The Star Trails menu opens a child-scoped settings page with three live 10-star previews, a visibility control, and one Save action. The dashboard renders the selected theme using the same card component as the previews. Magic Kingdom remains the default; Hogwarts Adventure and Middle-earth Journey each have their own colors, original vector scene, titles, star display, and milestone path. The settings RPC validates theme keys and child access, and saves theme and visibility together.

TDD: `tests/star-trail-themes.test.ts` failed on its missing theme module before implementation, then passed. The new pgTAP suite checks preference writes, invalid keys, and unrelated-parent rejection. Playwright checks the phone-sized previews, selection, save, hide, and a second child's independent default. Full page phone and desktop screenshots were reviewed; the Save control and visibility checkbox layout were adjusted after review.

Verification: `npm run e2e` passed (4 Chromium tests and local pgTAP), `npm run lint` passed, `npm run typecheck` passed, `npm test` passed (80 tests), `npm run build` passed, and `git diff --check` passed. The E2E runner used its dedicated unlinked local Supabase stack. No push or deployment.
