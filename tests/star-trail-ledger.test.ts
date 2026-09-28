import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Star Trail ledger", () => {
  it("awards weekly milestones atomically and reverses their bonus on Undo", async () => {
    const migration = await readFile(new URL("../supabase/migrations/202609280005_star_trail_ledger.sql", import.meta.url), "utf8");
    expect(migration).toContain("create table public.achievement_awards");
    expect(migration).toContain("achievement_bonus");
    expect(migration).toContain("achievement_bonus_undo");
    expect(migration).toContain("v_stars:=v_task_points");
    expect(migration).toContain("public.queue_task_completion");
    expect(migration).toContain("public.queue_task_undo");
  });
});
