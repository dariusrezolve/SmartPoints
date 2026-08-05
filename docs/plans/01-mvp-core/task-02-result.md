# F2 Result: Parent Settings and Child Profiles

## Outcome

An authenticated parent can manage isolated active child profiles from the protected root route. The profile selection is stored in the `child` URL query parameter and safely falls back to the first active profile. The shared household time zone is initialized from the browser on first-child creation, with UTC fallback, and is editable later.

## Implemented

- Added `parent_settings` and `children` migrations with ownership foreign keys, UTC timestamps, trimmed-name constraints, active-name uniqueness, archive timestamp, indexes, RLS, and authenticated table grants.
- Added a forward policy migration that limits child reads to active profiles, making archive one-way for the MVP. Restore and permanent deletion remain post-MVP.
- Added server actions for child creation, rename, archive, and household time-zone update.
- Added protected child-profile UI and focused name/time-zone validation tests.

## Verification

- Initial focused validation test failed before the domain validator existed, then passed after implementation.
- `npm run db:migrate:local` applied all three F2 migrations.
- Local inspection confirmed RLS on both tables, the expected policies, and the active case-insensitive unique-name index.
- A live local two-parent Data API flow confirmed owner creates settings/children, another parent reads zero rows, and cross-parent insert is denied. The archive policy was additionally corrected after testing showed that a broad read policy would otherwise permit restore.
- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.

## Notes and follow-up

- Local-only disposable Auth accounts and rows were used for verification; no hosted project or secret was used.
- F3 is dependency-ready: child-owned reusable tasks and a local starter catalog.
