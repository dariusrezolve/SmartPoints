import { describe, expect, it } from "vitest";
import { buildWeeklyStatistics, percentageChange } from "../lib/statistics/weekly-trends";

describe("weekly statistics trends", () => {
  it("compares adjacent weeks and nets task undo events", () => {
    const statistics = buildWeeklyStatistics([
      { effective_date: "2026-07-27", event_type: "task_completion", point_delta: 5, reward_id: null, task_id: "bathroom" },
      { effective_date: "2026-08-03", event_type: "task_completion", point_delta: 10, reward_id: null, task_id: "bathroom" },
      { effective_date: "2026-08-03", event_type: "task_completion_undo", point_delta: -5, reward_id: null, task_id: "bathroom" },
      { effective_date: "2026-08-04", event_type: "task_completion", point_delta: 8, reward_id: null, task_id: "reading" },
      { effective_date: "2026-07-29", event_type: "reward_redemption", point_delta: -4, reward_id: "screen", task_id: null },
      { effective_date: "2026-08-05", event_type: "reward_redemption", point_delta: -6, reward_id: "screen", task_id: null },
      { effective_date: "2026-08-06", event_type: "reward_redemption", point_delta: -2, reward_id: "treat", task_id: null },
      { effective_date: "2026-08-05", event_type: "reward_redemption_undo", point_delta: 6, reward_id: "screen", task_id: null },
    ], "2026-08-03");

    expect(statistics.received).toMatchObject({ current: 13, previous: 5, delta: 8, percentChange: 160 });
    expect(statistics.spent).toMatchObject({ current: 2, previous: 4, delta: -2, percentChange: -50 });
    expect(statistics.net).toMatchObject({ current: 11, previous: 1, delta: 10, percentChange: 1000 });
    expect(statistics.taskTrends.map(({ id, current, previous }) => ({ id, current, previous }))).toEqual([
      { id: "reading", current: 8, previous: 0 },
      { id: "bathroom", current: 5, previous: 5 },
    ]);
    expect(statistics.rewardTrends.find((item) => item.id === "screen")).toMatchObject({ current: 0, previous: 4, share: 0 });
    expect(statistics.currentReceivedDaily).toEqual([5, 8, 0, 0, 0, 0, 0]);
    expect(statistics.previousReceivedDaily).toEqual([5, 0, 0, 0, 0, 0, 0]);
  });

  it("uses a new/no-baseline state when the previous value is zero", () => {
    expect(percentageChange(12, 0)).toBeNull();
    expect(percentageChange(0, 0)).toBe(0);
    expect(percentageChange(5, 10)).toBe(-50);
  });
});
