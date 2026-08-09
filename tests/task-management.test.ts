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

  it("keeps the task or reward manager open after management actions", async () => {
    const actions = await readFile(new URL("../app/points/actions.ts", import.meta.url), "utf8");
    const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");

    expect(actions).toContain('done(childId, "tasks")');
    expect(actions).toContain('done(childId, "rewards")');
    expect(actions).toContain('doneWithMessage(childId, "Task deleted.", "tasks")');
    expect(home).toContain("initialManager=");
    expect(menu).toContain("initialManager");
    expect(menu).toContain("setEditingTask(null)");
    expect(menu).toContain("setEditingReward(null)");
  });

  it("allows rewards to be archived from the reward manager", async () => {
    const actions = await readFile(new URL("../app/points/actions.ts", import.meta.url), "utf8");
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");
    const migration = await readFile(
      new URL("../supabase/migrations/202608090010_archive_reward_rpc.sql", import.meta.url),
      "utf8",
    );

    expect(actions).toContain("export async function archiveReward");
    expect(actions).toContain('supabase.rpc("archive_reward"');
    expect(menu).toContain("Delete reward?");
    expect(migration).toContain("public.can_access_child(p_child_id)");
    expect(migration).toContain("update public.rewards");
  });

  it("offers quick add actions from the main task and reward sections", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain('aria-label="Add a task"');
    expect(workspace).toContain('aria-label="Add a reward"');
    expect(workspace).toContain("manage=tasks");
    expect(workspace).toContain("manage=rewards");
  });
});
