# Feature Plan: Per-child Star Trail themes

## Status

Approved by the user on 2026-09-29. F1 and F2 complete locally; no push or deployment.

## Outcome

Each child can keep the current Magic Kingdom Star Trail or choose one of two new fantasy themes: a Hogwarts-inspired wizard-school trail and a Lord of the Rings-inspired journey trail. A **Star Trails** menu item opens a child-scoped page with a visibility control, three live previews, and a theme choice. The dashboard uses the selected design without changing how stars or bonus points are earned.

## Recommendation and trade-off

Keep the existing 5/10/20/35-star milestones and +2/+3/+5/+8 bonuses for all themes, and vary only the visuals, labels, and badge names. The current award ledger is shared with points and Undo; reusing its rules avoids changing a child's rewards when they switch themes. This makes the themes equally paced, even if one story would naturally suggest different milestone numbers.

## Facts, assumptions, and open questions

- Facts:
  - `child_dashboard_preferences` currently stores a per-child `show_star_trail` flag, with missing rows defaulting to visible.
  - The dashboard card and its Magic Kingdom milestone labels are hard-coded in `points-workspace.tsx`.
  - The database awards fixed Magic Kingdom badge names in `achievement_awards`; history reads those stored names. Star and bonus calculations run in database RPCs and must remain atomic.
  - The workspace menu currently offers direct Hide/Show Star Trail actions, and `/achievements?child=` already has a child-scoped detail-page pattern.
- Assumptions recorded for plan approval:
  - New theme styling uses app-owned CSS/SVG and existing icon assets; there is no external image, font, API, or paid dependency.
  - Theme names and narrative copy can reference Hogwarts and Middle-earth, while artwork is created for this app rather than copied from films or books.
  - Existing children and awards remain Magic Kingdom unless that child's theme is changed.
- Open questions: none. The user chose to preserve previously earned badge names when changing themes.

## Theme content and visual direction

| Theme | Dashboard look | Starter title | 5 stars | 10 stars | 20 stars | 35 stars |
| --- | --- | --- | --- | --- | --- | --- |
| Magic Kingdom (existing default) | Current violet/fuchsia/amber gradient, gold star pouch, rainbow quest path. | Spark Scout | Rainbow Knight | Unicorn Guardian | Dragon Friend | Star Champion |
| Hogwarts Adventure | Midnight blue and plum with warm gold, an original castle silhouette, parchment accents, and a wand-spark trail. | First-Year Explorer | House Star | Spell Scholar | Phoenix Friend | Hogwarts Champion |
| Middle-earth Journey | Forest green and deep teal with bronze/gold, an original mountain/forest backdrop, leaf accents, and a winding journey path. | Shire Wanderer | Rivendell Scout | Fellowship Friend | Mithril Guardian | Light of the West |

All three use the same 5/10/20/35 milestone numbers and +2/+3/+5/+8 bonus values. The names above are the proposed product copy for this plan; approval includes them. App-owned vector/CSS decoration avoids an external asset dependency.

## Scope

### Included

- Three selectable themes per child: existing Magic Kingdom, wizard school, and Middle-earth journey.
- Distinct colors, decorative background, star display, quest path, and milestone/title copy for each theme; responsive and readable at a phone viewport.
- A Star Trails menu entry leading to a child-specific configuration page with visibility switch, theme previews, and an explicit save/select action.
- Child-scoped persistence, authorization, and a default that preserves the current Magic Kingdom appearance for existing children.
- The selected theme on the dashboard; previously earned badges retain their recorded name and theme, while future milestone awards use the theme selected at earning time.
- Focused unit, database authorization, and browser tests using the isolated local Supabase E2E stack.

### Excluded

- Changes to star accrual, milestone thresholds, bonus values, Undo, weekly resets, or reward behavior.
- New child accounts, social sharing, animation libraries, external art services, or licensed film/book artwork.
- Deployment or production migration before a separately requested release.

## Acceptance criteria

- [x] An existing child with no saved theme still sees the current Magic Kingdom trail and current visibility state.
- [x] A parent with access to a child can open Star Trails from that child's menu, preview all three designs, save one theme, and show or hide the card.
- [x] The selected theme and visibility persist across refreshes and are independent for each child.
- [x] The dashboard changes its colors, background motif, star/quest presentation, and titles to match the selected theme.
- [x] Stars, bonuses, milestone timing, Undo, and reset behavior are unchanged by theme switches.
- [x] A theme change leaves historical badge names and dates intact. New milestones use the selected theme's names, even when the switch occurs midweek; bonus values remain unchanged.
- [x] A parent with access to one shared child cannot view or change an unrelated child's theme through IDs or UI navigation.
- [x] The configuration page previews are usable on a phone-sized viewport and convey selection without relying on color alone.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | Choose and preview a child's trail | The Star Trails page saves theme/visibility, previews three designs, and the dashboard shows the choice; existing children retain Magic Kingdom. | Supabase preferences/RPC, workspace/menu/page components, theme content/assets, RLS. |
| F2 | Preserve themed badge history | Existing badge names remain; new awards snapshot the selected theme's name, with unchanged star and bonus math. | Award ledger function, award theme column, achievements display, migration/tests. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | F2, theme management | — | Owns the new preference and UI contract; no other task edits it concurrently. | Browser can preview, save, hide/show, switch children, and see the matching dashboard. |
| F2 | F1 | Release verification | — | Consumes the theme contract and changes the award RPC; keep sequential. | Database and browser checks prove preserved history and unchanged bonus values. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Badge-history switch | Preserve earned names or restyle history to the new theme? | Preserve earned names because `badge_name` records what was unlocked; history may mix themes after switching. | User: "go with your recommendation" — preserve earned names. | F2 snapshots the selected theme and themed name at award time; existing rows remain Magic Kingdom. | Resolved |

## Contracts and boundaries

- **Preference data:** add a constrained theme key to `child_dashboard_preferences` with `magic_kingdom` as the default. Keep visibility per child. Save both through an access-checked operation; do not allow arbitrary theme values or child-ID changes.
- **Ledger:** retain current thresholds, bonus values, weekly award identity, and child-specific Undo logic. Add an award `theme_key` with a Magic Kingdom default for existing rows. On new awards, store the child's selected theme and matching `badge_name` in the existing atomic award transaction; do not rewrite prior awards or point events.
- **UI:** use one typed theme definition source for dashboard labels and page previews, matching the database's award-name mapping. Previews display example progress at 10 stars without reading or modifying points. The Star Trails route receives a child ID and resolves it through the authenticated accessible-child list. Preview and visibility/theme controls update locally; an explicit Save action persists the chosen theme and visibility together.
- **Authorization:** the existing `can_access_child` boundary applies to preference writes and reads; a co-parent's shared-child access does not grant access to siblings.
- **Privacy/cost:** no personal data or keys in theme assets; no external provider or added paid dependency.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add failing preference, authorization, and UI tests, then implement the per-child Star Trails page, visual themes, dashboard integration, and menu route. | `supabase/migrations/*`, `supabase/tests/*`, `app/children/actions.ts`, `app/page.tsx`, `app/star-trails/page.tsx`, `app/components/*`, `lib/achievements/*`, `e2e/*` | Focused red/green, cross-child pgTAP, desktop and phone-sized browser flows on isolated local Supabase. |
| 2 | F2 | Add failing history tests, then snapshot the selected theme and themed badge name for new awards while preserving existing rows. | `app/achievements/page.tsx`, award migration/RPC, `supabase/tests/*` | Earn, switch midweek, Undo, reset, and cross-child tests. |
| 3 | F1–F2 | Update feature state/status and run required checks. | Documentation and test results. | `npm run e2e`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; no hosted data. |

## Risks and rollback

- A malformed theme key could break rendering; validate in the database and fall back to Magic Kingdom in UI code.
- Changing award naming logic could accidentally affect bonus creation or Undo; keep the existing amounts and identities, and cover them with pgTAP tests before release.
- Shared-parent reads must stay child-scoped; test unrelated IDs in the new route and setter.
- Revert the page/component and preference migration in a controlled follow-up if needed; existing Magic Kingdom data remains the default and point history is retained.

## Verification

- F1 began with a failing `tests/star-trail-themes.test.ts` import, then passed after the theme contract was implemented. F2 began with a failing isolated pgTAP run before the award migration; the updated pgTAP suite passes.
- `npm run e2e` passed: 4 Chromium browser tests plus pgTAP on the dedicated local `SmartPointsE2E` stack. The theme flow covers 390 px previews, save, hide, and a second child retaining Magic Kingdom.
- `npm run lint`, `npm run typecheck`, `npm test` (80 tests), `npm run build`, and `git diff --check` passed. Full page phone and desktop screenshots were reviewed; the save button and visibility checkbox were adjusted after review. No hosted database was used.
