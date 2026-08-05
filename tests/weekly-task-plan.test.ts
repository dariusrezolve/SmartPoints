import { describe, expect, it } from "vitest";
import { getPointSummary, getResetPointSummary, getWeekStart } from "../lib/points/validation";

describe("weekly task plan", () => {
  it("uses Monday as the shared plan boundary", () => {
    expect(getWeekStart("2026-08-02")).toBe("2026-07-27");
    expect(getWeekStart("2026-08-03")).toBe("2026-08-03");
  });

  it("separates the all-time balance from today’s received and redeemed points", () => {
    expect(getPointSummary([
      { effective_date: "2026-08-02", event_type: "task_completion", point_delta: 5 },
      { effective_date: "2026-08-03", event_type: "task_completion", point_delta: 3 },
      { effective_date: "2026-08-03", event_type: "reward_redemption", point_delta: -2 },
      { effective_date: "2026-08-03", event_type: "task_completion_undo", point_delta: -1 },
    ], "2026-08-03")).toEqual({ balance: 5, receivedToday: 3, redeemedToday: 2 });
  });

  it("uses reset values as the new weekly baseline and adds later activity", () => {
    expect(getResetPointSummary([
      { created_at: "2026-08-04T09:00:00Z", effective_date: "2026-08-04", event_type: "task_completion", point_delta: 4 },
      { created_at: "2026-08-04T11:00:00Z", effective_date: "2026-08-04", event_type: "reward_redemption", point_delta: -2 },
    ], "2026-08-03", { remaining_points: 10, received_points: 3, redeemed_points: 1, reset_at: "2026-08-04T10:00:00Z", week_start: "2026-08-03" })).toEqual({ balance: 8, receivedThisWeek: 3, redeemedThisWeek: 3 });
  });
});
