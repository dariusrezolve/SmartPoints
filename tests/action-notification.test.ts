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
});
