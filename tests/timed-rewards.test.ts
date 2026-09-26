import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { formatTimerRemaining } from "../lib/rewards/timers";

describe("timed reward configuration", () => {
  it("stores an optional bounded duration and exposes a time-based reward setting", async () => {
    const [migration, actions, menu] = await Promise.all([
      readFile(new URL("../supabase/migrations/202609260004_timed_reward_configuration.sql", import.meta.url), "utf8"),
      readFile(new URL("../app/points/actions.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8"),
    ]);

    expect(migration).toContain("duration_minutes integer");
    expect(migration).toContain("between 1 and 1440");
    expect(actions).toContain("timeBased");
    expect(actions).toContain("durationMinutes");
    expect(menu).toContain("Time based");
    expect(menu).toContain('name="durationMinutes"');
    expect(menu).toContain("defaultValue={30}");
  });
});

describe("timed reward countdown", () => {
  it("formats the remaining timer duration without showing negative time", () => {
    expect(formatTimerRemaining("2026-09-26T10:30:45.000Z", new Date("2026-09-26T10:00:00.000Z"))).toBe("30:45 remaining");
    expect(formatTimerRemaining("2026-09-26T10:00:00.000Z", new Date("2026-09-26T10:00:01.000Z"))).toBe("Time is up");
  });

  it("loads timers into reward cards and alerts when one finishes", async () => {
    const [page, workspace] = await Promise.all([
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8"),
    ]);

    expect(page).toContain('from("reward_timers")');
    expect(workspace).toContain("formatTimerRemaining");
    expect(workspace).toContain("Time is up");
    expect(workspace).toContain("new AudioContext");
    expect(workspace).toContain("new Notification");
  });
});
