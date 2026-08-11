"use client";

import { useEffect } from "react";
import { offlineSnapshotKey, saveOfflineSnapshot, type OfflineEvent, type OfflineReward, type OfflineTask } from "@/lib/offline/storage";

export function OfflineSnapshotWriter({ parentId, childId, childName, currentDate, balance, receivedThisWeek, redeemedThisWeek, tasks, rewards, events }: { parentId: string; childId: string; childName: string; currentDate: string; balance: number; receivedThisWeek: number; redeemedThisWeek: number; tasks: OfflineTask[]; rewards: OfflineReward[]; events: OfflineEvent[] }) {
  useEffect(() => { if (typeof indexedDB === "undefined") return; void saveOfflineSnapshot({ key: offlineSnapshotKey(parentId, childId), parentId, childId, childName, currentDate, balance, receivedThisWeek, redeemedThisWeek, tasks, rewards, events, savedAt: new Date().toISOString() }); }, [balance, childId, childName, currentDate, events, parentId, receivedThisWeek, redeemedThisWeek, rewards, tasks]);
  return null;
}
