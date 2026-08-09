import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("task management", () => {
  it("provides edit and archive task actions from the menu", async () => {
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");
    const actions = await readFile(new URL("../app/points/actions.ts", import.meta.url), "utf8");

    expect(menu).toContain("Edit tasks");
    expect(menu).toContain("Save task");
    expect(menu).toContain('title="Edit task"');
    expect(menu).toContain("Delete task?");
    expect(menu).toContain("selectedEditTaskIcon");
    expect(actions).toContain("export async function updateTask");
    expect(actions).toContain("export async function archiveTask");
    expect(actions).toContain("Week points reset.");
  });

  it("archives tasks through an atomic access-checked RPC", async () => {
    const actions = await readFile(new URL("../app/points/actions.ts", import.meta.url), "utf8");
    const migration = await readFile(
      new URL("../supabase/migrations/202608090009_archive_task_rpc.sql", import.meta.url),
      "utf8",
    );

    expect(actions).toContain('supabase.rpc("archive_task"');
    expect(migration).toContain("public.can_access_child(p_child_id)");
    expect(migration).toContain("delete from public.daily_task_selections");
    expect(migration).toContain("set is_active = false");
  });
});
