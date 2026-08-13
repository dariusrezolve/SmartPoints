import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("automatic additive offline reconciliation", () => {
  it("retries legacy failures automatically and sends captured values", async () => {
    const sync = await readFile(new URL("../app/components/offline-action-sync.tsx", import.meta.url), "utf8");
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(sync).toContain('action.status !== "queued" && action.status !== "needs_attention"');
    expect(sync).toContain("p_points: action.pointDelta");
    expect(sync).toContain("p_cost: Math.abs(action.pointDelta!)");
    expect(sync).toContain('action.kind === "undo_reward"');
    expect(sync).toContain("queue_reward_undo");
    expect(sync).toContain("window.setInterval");
    expect(sync).not.toContain('status: "needs_attention"');
    expect(workspace).not.toContain("Needs attention");
    expect(workspace).not.toContain("Discard");
  });

  it("offers reward Undo only for original redemption activity", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain('event.event_type === "task_completion" || event.event_type === "reward_redemption"');
    expect(workspace).toContain("queueRewardUndo");
  });

  it("uses idempotent captured-value RPCs and converges duplicate undos", async () => {
    const migration = await readFile(
      new URL("../supabase/migrations/202608090011_additive_offline_reconciliation.sql", import.meta.url),
      "utf8",
    );

    expect(migration).toContain("p_points integer");
    expect(migration).toContain("p_cost integer");
    expect(migration).toContain("insert into public.point_events");
    expect(migration).toContain("where reversal_of = p_event_id");
    expect(migration).toContain("public.can_access_child(p_child_id)");
  });

  it("adds an authorized, idempotent reward-redemption reversal contract", async () => {
    const migration = await readFile(
      new URL("../supabase/migrations/202608130001_reward_redemption_undo.sql", import.meta.url),
      "utf8",
    );

    expect(migration).toContain("reward_redemption_undo");
    expect(migration).toContain("public.undo_reward_redemption(p_event_id uuid)");
    expect(migration).toContain("public.queue_reward_undo(p_event_id uuid, p_request_id uuid)");
    expect(migration).toContain("where reversal_of = p_event_id");
    expect(migration).toContain("public.can_access_child(v_child_id)");
  });
});
