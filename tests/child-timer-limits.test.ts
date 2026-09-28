import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("child timer limits", () => {
  it("stores configurable per-child limits and exposes them from the workspace menu", async () => {
    const [migration, actions, menu, page] = await Promise.all([
      readFile(new URL("../supabase/migrations/202609280002_child_timer_limits.sql", import.meta.url), "utf8"),
      readFile(new URL("../app/children/actions.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    ]);

    expect(migration).toContain("max_concurrent_minutes integer not null default 60");
    expect(migration).toContain("max_daily_minutes integer not null default 120");
    expect(actions).toContain("updateChildTimerLimits");
    expect(menu).toContain("Timer limits");
    expect(page).toContain('from("child_timer_limits")');
  });
});
