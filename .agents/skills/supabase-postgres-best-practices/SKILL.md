---
name: supabase-postgres-best-practices
description: Postgres performance and safety practices for Supabase/Postgres queries, schema, RLS, and configuration.
license: MIT
---

# Supabase Postgres Best Practices

Apply when writing or reviewing SQL, indexes, schema, RLS, connection behavior, or database performance.

Priority order:

1. Query performance: use indexes that match filters/joins/order, avoid N+1 queries, inspect query plans, and use pagination.
2. Connection management: use an appropriate pooler, avoid exhausting connections, and keep transactions short.
3. Security/RLS: index policy predicates, avoid repeated expensive auth subqueries, grant least privilege, and verify policies with real roles.
4. Schema design: use appropriate data types, primary keys, constraints, foreign-key indexes, and lowercase identifiers.
5. Locking/concurrency: avoid long transactions, prevent deadlocks through consistent order, use advisory locks or `SKIP LOCKED` only when justified.
6. Data access: batch inserts/updates and use explicit upsert behavior.
7. Monitoring: use `EXPLAIN (ANALYZE, BUFFERS)`, `pg_stat_statements`, and vacuum/analyze evidence when diagnosing performance.
8. Advanced features: add full-text/JSONB indexes and partitioning only after a measured need.

For a fuller optional reference pack, consult current PostgreSQL and Supabase documentation rather than copying stale optimization examples into product code.
