# Architecture Principles

1. Prefer the smallest architecture that meets the approved MVP outcome.
2. Keep business rules deterministic, tested, and independent of providers.
3. Treat AI and third-party output as untrusted input; validate it at a clear boundary.
4. Design data access around least privilege, explicit ownership, and minimal retention.
5. Version external and AI contracts before relying on them.
6. Prefer reversible changes and documented migrations over destructive rewrites.
7. Do not introduce a provider, database, paid service, or deployment boundary without an approved plan.
8. Use a modular monolith: keep SmartPoints in one Next.js application until a concrete scaling, security, or ownership need justifies a separate deployable or package.
9. Enforce authorization with Supabase RLS on every product table; route checks and server actions are defense in depth, not the sole protection.
10. Use SQL migrations for every schema, RLS, and RPC change. Use narrow transactional RPCs only when a multi-step mutation cannot safely be expressed through ordinary server actions.
