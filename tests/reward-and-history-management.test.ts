import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("rewards and history", () => {
  it("supports reward icons and editing from the workspace menu", async () => {
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");
    const actions = await readFile(new URL("../app/points/actions.ts", import.meta.url), "utf8");

    expect(menu).toContain("Edit rewards");
    expect(menu).toContain("Save reward");
    expect(menu).toContain('title="Edit reward"');
    expect(menu).toContain("selectedEditRewardIcon");
    expect(actions).toContain("export async function updateReward");
  });

  it("renders scrollable, icon-led recent activity", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain("max-h-[31rem]");
    expect(workspace).toContain("overflow-y-auto");
    expect(workspace).toContain("TaskIcon");
  });
});
