# Feature Plan: Shared Parent Invitations

## Status

Approved — implementing

## Outcome

An owner can create an email-bound, one-time link for a child. A recipient opens it, creates a separate password-protected account, and then receives shared access to that child's workspace.

## Security contract

- Invitation secrets are generated server-side, stored only as SHA-256 hashes, and expire after seven days.
- The recipient email is fixed by the invitation and must match the authenticated account email when accepting.
- Invites are single-use. Owners can create links only for children they own.
- Access is represented by a child membership, never by sharing credentials or changing `children.parent_id`.
- Existing owner access is backfilled into memberships before policies/RPCs change.

## Dependency matrix

| ID | Depends on | Unlocks | Completion check |
| --- | --- | --- | --- |
| F1 Membership and invite schema/RLS | — | F2–F4 | Owner/shared-parent isolation queries pass. |
| F2 Shared access authorization | F1 | F3–F4 | Existing reads/mutations and RPCs allow a member and reject outsiders. |
| F3 Invite creation/share UI | F1 | F4 | Owner receives an email-bound one-time URL. |
| F4 Invite acceptance/password setup | F1, F2, F3 | Release | Correct-email account accepts once; wrong email/token fails safely. |

## Delivery notes

- Manual share-link is the approved MVP channel; email sending is post-MVP.
- The recipient must verify their email if the linked Supabase Auth project has confirmation enabled; after confirmation, reopening the same invitation completes access.
- Owner-only revocation and resend controls are post-MVP.
