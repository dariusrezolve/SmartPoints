import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Star Trail visibility", () => {
  it("stores a per-child dashboard preference and shows its menu action with an icon", async () => {
    const [migration, menu, workspace] = await Promise.all([
      readFile(new URL("../supabase/migrations/202609280007_star_trail_visibility.sql", import.meta.url), "utf8"),
      readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8"),
    ]);

    expect(migration).toContain("show_star_trail boolean not null default true");
    expect(menu).toContain("EyeOff");
    expect(menu).toContain("Show Star Trail");
    expect(workspace).toContain("showStarTrail");
  });
});
