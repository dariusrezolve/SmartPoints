import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Star Trail dashboard", () => {
  it("renders a Magic Kingdom quest card and links to achievement history", async () => {
    const [workspace, card, themes] = await Promise.all([
      readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/star-trail-card.tsx", import.meta.url), "utf8"),
      readFile(new URL("../lib/achievements/themes.ts", import.meta.url), "utf8"),
    ]);
    expect(themes).toContain("Magic Kingdom");
    expect(themes).toContain("Your star pouch");
    expect(themes).toContain("Quest path");
    expect(card).toContain("Achievements");
    expect(workspace).toContain("StarTrailCard");
    expect(workspace).toContain("starTrail");
    expect(themes).toContain("Unicorn Guardian");
    expect(themes).toContain("Spark Scout");
  });
});
