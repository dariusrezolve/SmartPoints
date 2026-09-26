# Task Result: Timed reward configuration

## Plan reference

[Timed Rewards plan](plan.md) — F1

## Changed

- Files: Added nullable, bounded reward duration storage; create/edit reward actions; and checkbox-driven reward editor fields.
- Contracts: Checking “Time based” reveals a required duration field defaulting to 30 minutes. Unchecked rewards store no duration. The database accepts only whole durations from 1 to 1,440 minutes.

## Verification

- `npm test -- --run tests/timed-rewards.test.ts` — red: duration migration absent; green: passed after implementation.
- `./node_modules/.bin/supabase test db --local supabase/tests/timed_reward_configuration.test.sql` — red: duration column absent; green: 3 passed after local migration.
- `npm run typecheck` — passed.
- `npm run lint` — passed.

## Outcome and remaining risks

Parents can now configure a timed reward, but a redemption does not yet create a countdown. F2 will add durable timer entries and make repeat redemption/Undo update their remaining duration.
