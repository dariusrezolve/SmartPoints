import { describe, expect, it } from "vitest";
import { applyPendingPointActions } from "../lib/offline/optimistic-summary";

describe("pending point actions", () => {
  it("immediately includes queued completions, redemptions, and undos in the dashboard totals", () => {
    const summary = applyPendingPointActions(
      { balance: 10, receivedThisWeek: 6, redeemedThisWeek: 2 },
      [
        { id: "complete", parentId: "parent", childId: "child", kind: "complete", taskId: "task", pointDelta: 3, createdAt: "2026-08-09T10:00:00Z", status: "queued" },
        { id: "redeem", parentId: "parent", childId: "child", kind: "redeem", rewardId: "reward", pointDelta: -4, createdAt: "2026-08-09T10:01:00Z", status: "queued" },
        { id: "undo", parentId: "parent", childId: "child", kind: "undo", eventId: "event", pointDelta: -2, createdAt: "2026-08-09T10:02:00Z", status: "queued" },
        { id: "rejected", parentId: "parent", childId: "child", kind: "complete", taskId: "task", pointDelta: 99, createdAt: "2026-08-09T10:03:00Z", status: "needs_attention" },
      ],
    );

    expect(summary).toEqual({ balance: 7, receivedThisWeek: 7, redeemedThisWeek: 6 });
  });
});
