import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("centered action notifications", () => {
  it("centers a high-contrast notification and distinguishes earned from redeemed points", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain("fixed left-1/2 top-1/2");
    expect(workspace).toContain("bg-emerald-700");
    expect(workspace).toContain("bg-amber-500");
    expect(workspace).toContain('kind: "task"');
    expect(workspace).toContain('kind: "redeem"');
  });

  it("acknowledges a tap before sync, leaves the notification non-blocking, and prevents duplicate pending taps", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain("pointer-events-none");
    expect(workspace).toContain("pendingActionKeysRef");
    expect(workspace).toContain('disabled={!isCurrentWeek || pendingActionKeys.has(`complete:${task.id}`)}');
    expect(workspace).toContain('disabled={pendingActionKeys.has(`redeem:${reward.id}`)}');
    expect(workspace).toContain("Saved. Syncing…");
  });
});
