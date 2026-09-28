import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("timer limit enforcement", () => {
  it("enforces active and daily limits in both redemption paths", async () => {
    const [migration, undoMigration] = await Promise.all([
      readFile(new URL("../supabase/migrations/202609280003_timer_limit_enforcement.sql", import.meta.url), "utf8"),
      readFile(new URL("../supabase/migrations/202609280004_timer_limit_undo_lock.sql", import.meta.url), "utf8"),
    ]);

    expect(migration).toContain("pg_advisory_xact_lock(hashtextextended(p_child_id::text, 2))");
    expect(migration).toContain("Active timer limit of % minutes reached");
    expect(migration).toContain("Daily timer limit of % minutes reached");
    expect(migration).toContain("create or replace function public.redeem_reward");
    expect(migration).toContain("create or replace function public.queue_reward_redemption");
    expect(undoMigration).toContain("pg_advisory_xact_lock(hashtextextended(v_child_id::text, 2))");
  });
});
