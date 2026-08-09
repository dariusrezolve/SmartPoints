import type { OfflineAction } from "@/lib/offline/storage";

type PointSummary = { balance: number; receivedThisWeek: number; redeemedThisWeek: number };

export function applyPendingPointActions(summary: PointSummary, actions: OfflineAction[]): PointSummary {
  return actions.filter((action) => typeof action.pointDelta === "number").reduce((total, action) => ({
    balance: total.balance + action.pointDelta!,
    receivedThisWeek: total.receivedThisWeek + (action.kind === "complete" || action.kind === "undo" ? action.pointDelta! : 0),
    redeemedThisWeek: total.redeemedThisWeek + (action.kind === "redeem" ? Math.abs(action.pointDelta!) : 0),
  }), summary);
}
