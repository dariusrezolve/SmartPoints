# F2 — Onboarding and points browser journey

Completed 2026-09-29. The Chromium journey signs up and signs in a synthetic parent, opts a child into the starter list, creates a 10-point daily task, checks 10 Star Trail stars, undoes the task, creates a 30-minute timed reward, checks its countdown, verifies timer-limit feedback, and undoes the reward.

The test exposed an existing client bug: SQL validation code `22023` was left queued as an offline action. A focused failing unit test was added first; the sync layer now removes these rejected actions and shows the database's validation message. Network failures remain queued.

Verification: focused sync-error tests passed; the desktop Chromium case passed against the isolated local stack.
