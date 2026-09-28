import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("quick-add daily task", () => {
  it("selects a task created from the header + through an access-checked RPC", async () => {
    const [workspace, menu, actions, migration] = await Promise.all([
      readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/points/actions.ts", import.meta.url), "utf8"),
      readFile(new URL("../supabase/migrations/202609280001_quick_add_daily_task.sql", import.meta.url), "utf8"),
    ]);

    expect(workspace).toContain("quickAddDailyTask");
    expect(menu).toContain('name="quickAddDailyTask"');
    expect(actions).toContain('rpc("create_task_and_select_daily"');
    expect(migration).toContain("public.can_access_child(p_child_id)");
    expect(migration).toContain("on conflict (child_id, task_id) do nothing");
  });
});
