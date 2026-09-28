# Current Feature State

## Customer-visible state

In the linked hosted Supabase project, an authenticated parent can create, select, rename, and archive child profiles; edit the shared household time zone; add starter or custom tasks; tap a task to earn points; undo a completion; add reusable rewards; and redeem a reward even when the balance becomes negative. The workspace displays the household current day, balance, and recent activity. After an online visit, the installed iPhone PWA opens its saved daily workspace immediately and queues completion, redemption, and Undo actions without connectivity before refreshing online data. A public Vercel production deployment is available for private-beta validation; a dedicated production backend, custom domain, and production email configuration remain pending.

The production onboarding flow gives a new parent an empty-family setup screen and an optional daily starter list for each child. The list copies six task definitions, five reward definitions, and the selected daily tasks into that child only. It copies no point or redemption history. Parents can share one child with another parent through the existing invitation flow; shared access is scoped to that child, while each parent can create and manage their own separate family.

The deployed notification update displays a large centered card after points actions: emerald for earned points, amber for redeemed points, slate for offline work, and red for errors.

The deployed timed-reward update lets parents mark a reward as Time based with a duration from 1 to 1,440 minutes. Redeeming extends that child’s active countdown for the reward, while Undo removes the recorded duration. The countdown appears on the reward card and, when it ends in an open workspace, shows the centered alert and plays a short tone.

The locally verified mobile responsiveness update immediately acknowledges a daily task or reward tap, prevents duplicate pending taps on that same card, and keeps the centered notification from blocking other workspace controls. It has not yet been deployed.

The locally verified activity update hides Undo after the corresponding task or reward action has already been reversed, including from cached mobile activity, and labels active controls by action type. It has not yet been deployed.

The locally verified Tasks header + flow adds each newly created task to the selected child’s daily task list automatically. It has not yet been deployed.

The locally verified timer-limit update adds a Timer limits menu entry for each child. It defaults to 60 active timed minutes and 120 net timed minutes per local day, rejects excess direct and queued redemptions atomically, and returns both allowances when a timed reward is undone. It has not yet been deployed.

## Important limitations

- Task/reward editing and hiding, prior-day current-week entry, complete weekly navigation, and the full dashboard summary are not implemented yet.
- Child-profile restore and permanent deletion are post-MVP.
- Production email/recovery configuration is not complete; hosted development currently uses the project Auth configuration.
- Preview environments do not have an isolated Supabase/Auth backend, so end-to-end signup validation uses production after release.
