# Current Feature State

## Customer-visible state

In the linked hosted Supabase project, an authenticated parent can create, select, rename, and archive child profiles; edit the shared household time zone; add starter or custom tasks; tap a task to earn points; undo a completion; add reusable rewards; and redeem a reward even when the balance becomes negative. The workspace displays the household current day, balance, and recent activity. After an online visit, the installed iPhone PWA opens its saved daily workspace immediately and queues completion, redemption, and Undo actions without connectivity before refreshing online data. A public Vercel production deployment is available for private-beta validation; a dedicated production backend, custom domain, and production email configuration remain pending.

## Important limitations

- Task/reward editing and hiding, prior-day current-week entry, complete weekly navigation, and the full dashboard summary are not implemented yet.
- Child-profile restore and permanent deletion are post-MVP.
- Production email/recovery configuration is not complete; hosted development currently uses the project Auth configuration.
