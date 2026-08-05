# Feature Plan: SmartPoints Core MVP

## Status

Implementing — F1 and F2 complete; subsequent tasks continue in dependency order.

## Outcome

A parent can sign in, manage multiple child profiles, repeatedly award points for predefined or custom tasks with one click, redeem reusable rewards (including in advance), and understand each child’s balance and activity for the current week.

## Facts, assumptions, and open questions

### Facts

- SmartPoints is a parent-operated web application for children, especially younger children who do not manage their own profiles.
- A single authenticated parent account manages multiple child profiles.
- Tasks and rewards belong to one child profile; they are not shared across siblings.
- Tasks are reusable: a parent can complete the same task repeatedly and each completion earns its configured points.
- A parent completes a task through a simple one-click icon action and can undo it.
- Parents choose a predefined task or create a custom task; both have parent-configured point values.
- Rewards are reusable. Parent redemption immediately deducts the reward’s points.
- Parents may redeem points in advance. A child balance may be negative without an MVP debt limit, and later task completions pay it down.
- The operational week is Monday–Sunday. The default view is today; parents can record or undo activity for an earlier day in the current week, never a future day. Balances carry across weeks.
- The dashboard is a per-child snapshot plus recent activity, not charts, streaks, or behavioral scoring.
- The approved MVP stack is a Next.js web application with Supabase Auth and Postgres.

### Assumptions

- Timestamps are stored in UTC. The shared household IANA time zone is initialized automatically from the browser without blocking first-child creation; it determines today and the Monday–Sunday week boundary for all child profiles and remains editable in settings.
- Email/password authentication will use Supabase’s supported recovery flow; the required email provider/configuration is an implementation prerequisite.
- Predefined tasks are a small, local, non-personal starter catalog. Selecting one creates a child-specific task that a parent can edit.
- A "recent activity" list initially contains the current week’s events, newest first.

### Open questions

None material for this MVP. Copy, visual style, and the exact starter task labels are implementation details to be validated during design and testing.

## Scope

### Included

- Parent email/password registration, sign-in, sign-out, and password recovery.
- Parent-owned child profiles and profile switching.
- Child-specific reusable tasks, using a predefined starter catalog or custom task input.
- Archive a child profile to remove it from normal use while retaining its history.
- One-click task completion, date selection for today/prior days in the current week, immutable activity history, and undo.
- Child-specific reusable rewards, immediate redemption, and unlimited negative balances.
- Parent dashboard showing a child’s current balance, total points earned, task-completion count, reward-redemption count, and current-week activity.
- Responsive, accessible parent-operated UI with a visible current day and current-week navigation.
- Supabase migrations, row-level security, and authorization-aware tests.

### Excluded

- Child logins, child self-service completion, or child redemption requests.
- Permanent child-profile deletion and related data-erasure workflow.
- Restoring archived child profiles.
- Recurrence schedules, task limits, points caps, or automatic verification.
- Shared family tasks/rewards or bulk application across children.
- Rewards with inventory, one-time use, or limited quantities.
- Configurable maximum debt, debt warnings, or debt repayment rules beyond applying later earned points to the balance.
- Editing activity in prior weeks, future-dated activity, charts, streaks, behavior scoring, notifications, payments, external account connections, or AI features.
- Replacing the managed Supabase backend; an alternative/self-managed backend is post-MVP work.

## Acceptance criteria

- [ ] A parent can create an account, sign in/out, and recover a password without exposing server-only credentials to the browser.
- [ ] A parent can add, view, switch between, edit, and remove their own child profiles; they cannot access another parent’s profiles or data.
- [ ] For a selected child, a parent can create an editable task from a predefined option or custom text and assign a positive whole-number point value.
- [ ] The parent can tap a task’s completion icon to record a completion for today; the configured points are added exactly once and the event appears in activity.
- [ ] The parent can record a completion for a previous day in the current Monday–Sunday week, but cannot choose a future date or a date from a prior week.
- [ ] Undoing a completion reverses exactly its awarded points and clearly identifies the reversal in activity; it cannot be undone twice.
- [ ] A parent can create, edit, hide, and redeem a child-specific reusable reward with a positive whole-number point cost.
- [ ] A redemption deducts points immediately even when the balance becomes negative; the UI clearly displays the negative amount as points still to earn back.
- [ ] The same reward can be redeemed repeatedly, and a later task completion increases the same running balance across week boundaries.
- [ ] The selected child’s dashboard shows current balance, total points earned, completion count, reward-redemption count, and current-week activity; a parent can navigate the current week’s days.
- [ ] Supabase migrations run through the repository scripts, apply only tracked pending migrations, default linked-database execution to a dry run, and never reset a database.
- [ ] Supabase RLS and server-side mutation boundaries prevent cross-parent reads/writes and reject invalid point values, foreign-child references, duplicate reversal, future dates, and dates outside the current week.
- [ ] No AI model, paid provider beyond the approved managed MVP backend, raw personal data fixture, or secret is introduced.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | Establish the secure Next.js/Supabase foundation so a parent can access the app. | Auth works; environment boundaries and health checks are documented. | Web, auth, configuration, deployment. |
| F2 | A parent can create and switch isolated child profiles. | Parent can manage only their own profiles. | Web, API/RPC, data, authorization. |
| F3 | A parent can configure a child’s reusable task list from starter or custom tasks. | Child-specific editable tasks have valid point values. | Web, data, authorization. |
| F4 | A parent can award and undo task points for a day in the current week. | Accurate, non-duplicable ledger events and reversals are shown. | Web, API/RPC, data, authorization, date rules. |
| F5 | A parent can configure and redeem a child’s reusable rewards, including in advance. | Redemptions deduct points and may produce a clear negative balance. | Web, API/RPC, data, authorization. |
| F6 | A parent can review a child’s weekly activity and summary. | Snapshot and current-week navigation accurately derive from the ledger. | Web, data/query performance. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | F2–F6 | — | Authentication and environment contracts are shared by all later work. | Authenticated parent reaches an empty, protected app shell. |
| F2 | F1 | F3–F6 | — | Child ownership is the authorization boundary for every subsequent record. | A parent can only retrieve and mutate their own child profiles. |
| F3 | F2 | F4 | — | Completions must reference a child-owned task. | A selected child has valid predefined/custom reusable tasks. |
| F4 | F3 | F5–F6 | — | The point ledger and balance semantics are shared contracts. | Completion and one-time undo yield the expected ledger and balance. |
| F5 | F2, F4 | F6 | — | Redemptions write to the same ledger and must follow its validated balance contract. | A reusable reward can be redeemed into a negative balance. |
| F6 | F4, F5 | MVP integration gate | — | Summary and activity depend on finalized ledger event types. | Per-child figures agree with ledger data for the current week. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Child access | Shared family profiles or child logins? | Shared profiles minimize child data and onboarding; child logins support independent access later. | One parent account; children use profiles, not credentials. | Parent-only flows and child-profile data model. | Resolved |
| Parent auth | Email/password or magic link? | Email/password is familiar and supports predictable account recovery; magic links depend more on email delivery. | Email and password. | Add Supabase password-recovery setup. | Resolved |
| Task verification | Parent-only completion or child request/approval? | Parent-only completion is simplest and prevents unverified point awards. | Parent logs completion with a simple icon click. | No child-action or approval state. | Resolved |
| Task cadence | Recurring schedules or repeated tasks? | Reusable tasks avoid scheduler complexity and serve frequent activities. | Same task can be completed any number of times. | No recurrence model; completion ledger is required. | Resolved |
| Completion errors | Permanent or undoable? | Undo protects one-click operation while preserving an audit trail. | Include undo. | Add reversal linkage and idempotency guard. | Resolved |
| Reward availability | Reusable or limited inventory? | Reusable rewards serve common treats/privileges with minimal inventory logic. | Reusable only. | Defer one-time/limited quantities. | Resolved |
| Advance spending | Block negative balances or allow debt? | Parent control allows flexibility; a debt cap can be added later. | Unlimited negative balance. | Ledger accepts negative balance and labels debt in UI. | Resolved |
| Family scope | One child or multiple children? | Multiple profiles match a family product; requires a child switcher. | Multiple profiles. | Scope all data and dashboard by child. | Resolved |
| Task ownership | Shared or child-specific tasks/rewards? | Per-child configuration permits different point values and rewards. | Per-child. | No shared-family catalog beyond local starter templates. | Resolved |
| Insights | Snapshot or charts/streaks? | Snapshot and recent activity offer immediate value without premature analytics. | Snapshot plus recent activity. | Defer charts, streaks, and scoring. | Resolved |
| Time window | Week/correction policy? | Monday–Sunday with same-week backdating supports weekly review and protects future data. | Monday–Sunday; current-week past dates only. | Add time-zone-aware date validation. | Resolved |
| Foundation | Stack selection? | Next.js + Supabase is compact for this authenticated MVP; it uses a managed backend. | Next.js + Supabase. | Separate API deferred; managed-backend replacement is post-MVP. | Resolved |
| Migration CLI | Project-pinned or globally installed Supabase CLI? | Pinning the local CLI gives reproducible migration behavior and avoids global-version drift; it adds one development dependency. | Require the project-pinned local CLI. | Migration helpers invoke `node_modules/.bin/supabase` only. | Resolved |
| Local Docker platform | Preserve a global Docker platform override or scope an override for Supabase? | Clearing it for SmartPoints avoids an incompatible image-platform request while preserving global settings for other work. | Clear `DOCKER_DEFAULT_PLATFORM` only in SmartPoints Supabase helpers. | Add project `db:start` and use the scoped runner for migrations/status. | Resolved |
| Child profile removal | Archive or permanently delete a child profile? | Archiving protects activity/history from accidental loss; permanent deletion supports future data-erasure needs. | Archive by default for MVP. | Add archive state and exclude archived profiles from normal views; defer permanent deletion. | Resolved |
| Household time zone | One shared time zone or one per child? | A family-wide setting keeps one weekly calendar; per-child time zones support cross-time-zone families later. | One shared parent/family time zone. | Store time zone in parent settings, not child profiles. | Resolved |
| F2 ownership model | Store parent settings separately or repeat settings per child? | One `parent_settings` row plus parent-owned children gives a clear shared boundary and simple RLS; repeated settings allow future per-child variance. | One-to-one `parent_settings` (`id = auth.uid()`) and `children.parent_id`. | Protect both with ownership RLS. | Resolved |
| F2 mutation boundary | Use server actions or direct browser data calls? | Server actions centralize validation while RLS remains the database defense; direct calls can be more interactive. | Next.js server actions with RLS on every product table. | Implement child-profile mutations through server actions. | Resolved |
| Architecture alignment | Copy WayWeGo’s architecture exactly or apply its principles proportionally? | The same modular-monolith security/operations practices fit SmartPoints; a workspace is premature for one app. | Adopt the same architecture principles, retain single-app layout. | Use App Router, server actions, Supabase RLS, migrations, and narrow RPCs where needed. | Resolved |
| Selected child state | Keep selection only in browser state or make it route state? | URL state survives refresh and matches route-driven resource selection; local-only state is visually quieter. | Use a validated `child` query parameter. | Fall back safely to the first active profile when missing/invalid. | Resolved |
| Child names | Allow duplicate active names or require per-family uniqueness? | Unique names keep profile selection unambiguous; duplicates accommodate same-name siblings. | Require case-insensitive unique active names per parent. | Archived names may be reused. | Resolved |
| Time-zone initialization | Require confirmation or set browser time zone automatically? | Automatic setup is frictionless while a persisted setting keeps server rules consistent; confirmation prevents a potentially incorrect default. | Store timestamps in UTC and initialize shared household time zone from the browser without confirmation. | Let parent edit the setting later; do not block first-child creation. | Resolved |
| Archive restoration | Allow a parent to restore an archived profile? | Restore protects against accidental archival; deferring it keeps MVP management minimal. | Defer restore until post-MVP. | Archive is one-way in MVP; history remains retained. | Resolved |
| Archive representation | Use a timestamp or boolean archive flag? | An `archived_at` timestamp preserves audit context and supports future restore; a boolean is marginally simpler. | Use UTC `archived_at`. | Filter active profiles by `archived_at is null`. | Resolved |
| Parent-settings creation | Create settings at auth signup or with first child profile? | Lazy creation avoids an Auth trigger and captures the browser time zone in the same validated action; an auth trigger creates settings for inactive accounts. | Create/upsert settings with first child profile. | No Auth trigger in MVP. | Resolved |
| Parent-account deletion | Retain or cascade family data when the Auth user is deleted? | Cascading prevents orphaned family data and supports future approved erasure; retention requires a separate cleanup workflow. | Cascade to parent settings and child profiles. | Do not expose auth-account deletion casually in MVP. | Resolved |
| Child-name validation | Leave child names unbounded or apply a length limit? | A trimmed 1–80 character name protects switcher/database usability; no limit allows any label. | Require 1–80 trimmed characters. | Enforce in server action and database constraint. | Resolved |
| Time-zone validation | Trust browser value or require an IANA time zone with fallback? | IANA validation gives consistent server date rules; trusting any value is simpler but unsafe. | Require valid IANA zone, otherwise use UTC. | Validate in server action before parent-settings upsert. | Resolved |
| F2 first-child mutation | Use an RPC transaction or ordinary server actions? | Ordinary RLS-protected actions are simpler; an RPC would make settings/profile creation atomic. | Use ordinary server actions, no F2 RPC. | A harmless settings-only row is acceptable if child creation fails. | Resolved |
| Remaining F2 details | Ask each remaining implementation detail separately or follow the established recommendations? | Per-detail review maximizes control; applying stated recommendations keeps the approved task moving. | User authorized remaining F2 recommendations. | Record material choices in task result. | Resolved |
| Basic workspace delivery | Deliver task setup alone first, or a vertical slice with completion and reward redemption? | A shared immutable ledger is required for an honest usable UI; task-only setup is smaller but cannot show or redeem points. | Approved vertical slice using transactional RPCs for completion, undo, and redemption. | Implement basic F3–F5 UI together while retaining their remaining polish. | Resolved |
| Daily task availability | Set tasks one day at a time or automatically for the current week? | A Monday–Sunday weekly selection keeps daily logging fast and aligns with the existing current-week correction window; per-day plans offer more variation but add repetitive setup. | Automatically apply the selected child-specific tasks to every day of the current week. | Keep tasks as a reusable catalog; add a protected weekly task-plan list and require it for completions. | Resolved |
| Daily dashboard metrics | Show today-only or week-to-date received/redeemed points? | Today-only figures make the daily workflow immediately understandable while the remaining balance carries prior activity; week totals offer more trend context but blur the current-day outcome. | Show all-time remaining balance plus today’s received and redeemed points. | Read the full ledger for summary totals while keeping the activity preview bounded. | Resolved |
| Task icon system | Use emoji or an SVG icon library for child-friendly task tiles? | Lucide React provides consistent, tree-shakeable SVG components and a curated picker keeps setup simple; emoji avoid a dependency but vary by platform. | Use a curated Lucide icon set. | Store validated icon names on tasks, default existing tasks safely, and show icon-plus-points tiles with task-name tooltips. | Resolved |
| Weekly reset | Reset the balance only or overwrite all weekly point figures? | A complete weekly override gives parents a clean correction tool; balance-only is safer but leaves received/redeemed figures inconsistent. | Confirmed reset-all action that overwrites remaining, received, redeemed, and visible current-week activity. | Store a protected weekly reset anchor; subsequent activity accumulates from it and hidden prior events remain retained internally. | Resolved |

## Contracts and boundaries

### Web

- Protected parent routes: sign-in/recovery, child switcher, current-week workspace, task/reward management, and dashboard.
- Parent action controls must be keyboard accessible, have explicit labels, and prevent duplicate submission while a mutation is pending.
- The child balance is display-only derived state; it must not be trusted as a browser-supplied mutation input.

### Authentication and authorization

- Supabase Auth owns parent identity. Store no child credentials or child email addresses.
- Every child, task, reward, and ledger event is owned through the authenticated parent’s child profile.
- Enable RLS on every exposed table. Policies must validate ownership, not merely require `authenticated`.
- Server-side functions/RPCs own activity mutations and validate ownership, integer point values, permitted dates, source references, and reversal state.

### Data

- `children`: parent-owned profile, display name, and time-zone preference (or a parent-settings record if shared across children).
- `tasks`: child ID, name, positive integer points, optional starter-template key, visibility/audit fields.
- `rewards`: child ID, name, positive integer cost, active/hidden state, audit fields.
- `point_events`: immutable child-owned ledger entries with event type (`task_completion`, `task_completion_undo`, `reward_redemption`), signed point delta, effective local date, creation timestamp, source task/reward ID when applicable, and reversal reference where applicable.
- Use foreign-key indexes and indexes supporting child-scoped activity ordered by effective date/creation time. Do not store a mutable client-authoritative balance; derive it from valid ledger events or maintain it transactionally only behind a verified server-side boundary.

### Date and balance rules

- The server converts the authenticated parent’s configured IANA time zone into the current local date/week; the client cannot choose a date outside Monday–Sunday of that week or in the future.
- A completion writes one positive ledger event. Undo writes one compensating negative ledger event linked to the original completion; the original cannot be reversed twice.
- A redemption writes one negative ledger event, with no non-negative-balance requirement. Balances may be negative without a cap.
- Totals are derived deterministically: balance is the signed ledger sum; points earned is the sum of completion deltas before reversal; completion/redemption counts follow their respective source events, with reversal treatment explicitly reflected in UI copy and tests.

### AI, providers, analytics, and privacy

- No AI capability, prompt, model, or AI evaluation is in scope.
- Supabase is the sole approved managed backend for the MVP. No payment, analytics, email marketing, or external account provider is in scope.
- Send/store the minimum data: parent auth identity, child display name, and point activity. Do not place child personal information in test fixtures, logs, URLs, or documentation.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Bootstrap pinned Next.js app; initialize Supabase configuration and tracked migration scripts; configure Supabase client boundaries, email/password auth, recovery, local env example, and basic health checks. Before coding, read current Supabase changelog/docs and confirm CLI commands. | App shell, `supabase/`, `scripts/`, auth client/server boundary, `.env.example`, architecture docs. | Local migration apply; linked dry run; lint/typecheck/test/build; sign-in/recovery authorized-flow check; verify no server key reaches browser. |
| 2 | F2 | Create reviewed migrations for parent-owned children/settings; enable RLS and ownership policies; implement profile management/switcher. | `supabase/migrations`, child/settings contracts, protected UI. | Migration inspection; real-role cross-parent read/write denial test; child CRUD tests. |
| 3 | F3 | Add child-owned tasks and a small local starter catalog; implement task management. | Task migration/contracts, task form/list UI. | Constraints and ownership tests; custom and starter task flow tests. |
| 4 | F4 | Add validated point-event mutation boundary and activity UI; implement current-week date picker, completion icon, and one-time undo. | Ledger migration/RPCs, date helpers, task/activity UI. | Transaction/idempotency tests; time-zone/date-boundary tests; RLS and foreign-reference rejection; live authorized-flow check. |
| 5 | F5 | Add rewards and redemption mutation; show positive/negative balance and clear debt copy. | Reward migration/contracts, redemption UI, balance display. | Reusable redemption and negative-balance tests; cross-child denial test; current balance matches ledger. |
| 6 | F6 | Build per-child weekly dashboard and integration polish; reconcile summary with ledger. | Dashboard queries/components, accessibility/responsive checks, product/architecture/status docs. | End-to-end MVP scenario; query-plan/index review; lint/typecheck/test/build; documented integration result. |

## Risks and rollback

- **Unauthorized family-data access:** contain with ownership-based RLS, server-side mutation validation, and real-role authorization tests. Roll back migrations only through a reviewed forward migration; never disable RLS as a workaround.
- **Incorrect balances or duplicate taps:** use transactional, idempotent mutation boundaries and immutable compensating reversals. Contain by disabling a faulty action and correcting through an audited forward event/migration rather than deleting history.
- **Week/date errors around midnight or time zones:** derive boundaries on the server from a visible configured IANA time zone and test boundary cases. Roll back a UI release while retaining ledger history if needed.
- **Child privacy exposure:** retain minimal profile data, avoid third-party analytics/AI, and keep personal data out of fixtures/logs. Removing an optional future provider requires an approved retention/deletion plan.
- **Managed-backend dependence:** Supabase is an intentional MVP dependency. Replacing it is deferred until product evidence justifies the migration cost.
