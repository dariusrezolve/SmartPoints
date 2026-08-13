"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineAction, listOfflineActions, removeOfflineAction, type OfflineAction } from "@/lib/offline/storage";

export type ActionSyncResult = { status: "synced" | "offline" | "queued"; reason?: string };

export function useOfflineActionSync(parentId: string) {
  const [queued, setQueued] = useState(0);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const activeSyncRef = useRef<Promise<ActionSyncResult> | null>(null);

  const refresh = useCallback(async () => {
    const actions = (await listOfflineActions()).filter((action) => action.parentId === parentId);
    const pending = actions.map((action) => action.status === "needs_attention" ? { ...action, status: "queued" as const } : action);
    await Promise.all(pending.filter((action, index) => action !== actions[index]).map(enqueueOfflineAction));
    setQueued(pending.length);
    setPendingActions(pending);
  }, [parentId]);

  const performSync = useCallback(async (requestedActionId?: string): Promise<ActionSyncResult> => {
      let requestedResult: ActionSyncResult | undefined;
      const supabase = createClient();
      for (const action of await listOfflineActions()) {
        if (action.parentId !== parentId || (action.status !== "queued" && action.status !== "needs_attention")) continue;
        let error: { message: string } | null = null;
        try {
          if (action.kind === "complete") ({ error } = await supabase.rpc("queue_task_completion", { p_child_id: action.childId, p_task_id: action.taskId!, p_effective_date: action.effectiveDate!, p_points: action.pointDelta, p_request_id: action.id }));
          else if (action.kind === "undo") ({ error } = await supabase.rpc("queue_task_undo", { p_event_id: action.eventId!, p_request_id: action.id }));
          else if (action.kind === "undo_reward") ({ error } = await supabase.rpc("queue_reward_undo", { p_event_id: action.eventId!, p_request_id: action.id }));
          else ({ error } = await supabase.rpc("queue_reward_redemption", { p_child_id: action.childId, p_reward_id: action.rewardId!, p_cost: Math.abs(action.pointDelta!), p_request_id: action.id }));
        } catch (caught) {
          error = { message: caught instanceof Error ? caught.message : "Unable to reach SmartPoints." };
        }
        if (error) {
          await enqueueOfflineAction({ ...action, status: "queued", reason: error.message });
          if (action.id === requestedActionId) requestedResult = { status: "queued", reason: error.message };
        } else {
          await removeOfflineAction(action.id);
          if (action.id === requestedActionId) requestedResult = { status: "synced" };
        }
      }
      await refresh();
      return requestedResult ?? { status: "synced" };
  }, [parentId, refresh]);

  const sync = useCallback(async (requestedActionId?: string): Promise<ActionSyncResult> => {
    if (!navigator.onLine) return { status: "offline" };
    if (activeSyncRef.current) {
      await activeSyncRef.current;
      if (!requestedActionId) return { status: "synced" };
      const action = (await listOfflineActions()).find((item) => item.id === requestedActionId);
      if (!action) return { status: "synced" };
      return performSync(requestedActionId);
    }

    setSyncing(true);
    const work = performSync(requestedActionId);
    activeSyncRef.current = work;
    try { return await work; } finally { activeSyncRef.current = null; setSyncing(false); }
  }, [performSync]);

  useEffect(() => {
    const timer = window.setTimeout(() => { setIsOnline(navigator.onLine); void refresh(); void sync(); }, 0);
    const onOnline = () => { setIsOnline(true); void sync(); };
    const onOffline = () => setIsOnline(false);
    const onVisibilityChange = () => { if (document.visibilityState === "visible" && navigator.onLine) void sync(); };
    const retryTimer = window.setInterval(() => { if (navigator.onLine) void sync(); }, 15_000);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => { window.clearTimeout(timer); window.clearInterval(retryTimer); window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); document.removeEventListener("visibilitychange", onVisibilityChange); };
  }, [refresh, sync]);

  const queue = useCallback(async (action: Omit<OfflineAction, "id" | "parentId" | "createdAt" | "status">) => {
    const queuedAction: OfflineAction = { ...action, id: crypto.randomUUID(), parentId, createdAt: new Date().toISOString(), status: "queued" };
    await enqueueOfflineAction(queuedAction);
    await refresh();
    return queuedAction;
  }, [parentId, refresh]);

  return { queue, queued, syncing, sync, pendingActions, isOnline };
}
