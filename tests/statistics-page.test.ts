import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("weekly statistics", () => {
  it("provides a Statistics menu entry and a previous-week dashboard", async () => {
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");
    const page = await readFile(new URL("../app/statistics/page.tsx", import.meta.url), "utf8");

    expect(menu).toContain("Statistics");
    expect(page).toContain("Previous week");
    expect(page).toContain("Points received");
    expect(page).toContain("Points redeemed");
  });
});
