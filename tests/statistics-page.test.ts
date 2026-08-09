import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("weekly statistics", () => {
  it("provides a Statistics menu entry and a previous-week dashboard", async () => {
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");
    const page = await readFile(new URL("../app/statistics/page.tsx", import.meta.url), "utf8");

    expect(menu).toContain("Statistics");
    expect(menu).toContain('<Button asChild className="w-full justify-start"');
    expect(page).toContain("Previous week");
    expect(page).toContain("Points received");
    expect(page).toContain("Points redeemed");
    expect(menu).toContain("Statistics");
  });

  it("filters recent activity to the selected week", async () => {
    const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

    expect(home).toContain('gte("effective_date", viewedWeekStart)');
    expect(home).toContain('lt("effective_date", shiftWeek(viewedWeekStart, 1))');
  });
});
