# F3 — Shared-parent browser journey

Completed 2026-09-29. Two separate Chromium contexts sign up as different parents. One shares a child using the app's one-time invitation link. The invited parent accepts it and can switch between that shared child and an independently created child; the original parent cannot see the independent child.

Verification: the shared-parent Chromium case passed against the isolated local stack.
