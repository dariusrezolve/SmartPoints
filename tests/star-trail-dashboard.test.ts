import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Star Trail dashboard", () => {
  it("renders a Magic Kingdom quest card and links to achievement history", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");
    expect(workspace).toContain("Magic Kingdom");
    expect(workspace).toContain("Your star pouch");
    expect(workspace).toContain("Next quest");
    expect(workspace).toContain("Quest path");
    expect(workspace).toContain("Achievements");
    expect(workspace).toContain("starTrail");
    expect(workspace).toContain("Unicorn Guardian");
    expect(workspace).toContain("Spark Scout");
  });
});
