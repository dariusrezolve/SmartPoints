import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("account-wide daily task selection", () => {
  it("reads daily task selections without a week filter", async () => {
    const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
    const actions = await readFile(new URL("../app/points/actions.ts", import.meta.url), "utf8");

    expect(home).toContain('from("daily_task_selections")');
    expect(actions).toContain('replace_daily_task_selection');
  });

  it("uses one-click task buttons and a duplicate-safe removable daily list", async () => {
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");

    expect(menu).toContain("new Set(selectedTaskIds)");
    expect(menu).toContain("Available tasks");
    expect(menu).toContain("Daily list");
    expect(menu).toContain(".filter((task) => !dailyTaskIds.has(task.id))");
    expect(menu).toContain("Remove ${task.name}");
  });

  it("closes the daily-task dialog before opening the task editor", async () => {
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");

    expect(menu).toContain("function switchModal");
    expect(menu).toContain("window.requestAnimationFrame");
    expect(menu).toContain('onClick={() => switchModal("task")}');
  });

  it("aliases the unnested task id column explicitly in the save function", async () => {
    const migration = await readFile(
      new URL("../supabase/migrations/202608090008_fix_daily_task_selection_rpc.sql", import.meta.url),
      "utf8",
    );

    expect(migration).toContain("as selected(task_id)");
    expect(migration).toContain("task.id = selected.task_id");
    expect(migration).toContain("select p_child_id, selected.task_id");
  });
});
