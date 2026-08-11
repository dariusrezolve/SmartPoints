"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { CheckCircle2, Gift, RotateCcw, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { useOfflineActionSync } from "@/app/components/offline-action-sync";
import { TaskIcon } from "@/lib/points/task-icons";
import { applyPendingPointActions } from "@/lib/offline/optimistic-summary";
import { loadLatestOfflineSnapshot, type OfflineSnapshot } from "@/lib/offline/storage";
import type { TaskIconName } from "@/lib/points/validation";

export default function OfflinePage() {
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | null | undefined>(undefined);
  useEffect(() => { void loadLatestOfflineSnapshot().then(setSnapshot).catch(() => setSnapshot(null)); }, []);

  if (snapshot === undefined) return <main className="workspace-page mx-auto w-full max-w-xl px-5 pb-10 pt-6"><Card className="p-5 sm:p-6"><p className="text-sm text-slate-600">Loading your saved workspace…</p></Card></main>;
  if (!snapshot) return <main className="workspace-page mx-auto w-full max-w-xl px-5 pb-10 pt-6"><Card className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Offline mode</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">You&apos;re offline</h1><p className="mt-3 text-sm text-slate-600">Open SmartPoints online once to save the daily workspace on this iPhone.</p></Card></main>;

  return <CachedWorkspace snapshot={snapshot}/>;
}

function CachedWorkspace({ snapshot }: { snapshot: OfflineSnapshot }) {
  const router = useRouter();
  const { queue, queued, syncing, sync, pendingActions, isOnline } = useOfflineActionSync(snapshot.parentId);
  const [notice, setNotice] = useState<string | null>(null);
  const refreshStarted = useRef(false);
  const events = useMemo(() => snapshot.events ?? [], [snapshot.events]);
  const taskPoints = useMemo(() => new Map(snapshot.tasks.map((task) => [task.id, task.points])), [snapshot.tasks]);
  const rewardCosts = useMemo(() => new Map(snapshot.rewards.map((reward) => [reward.id, reward.cost])), [snapshot.rewards]);
  const eventDeltas = useMemo(() => new Map(events.map((event) => [event.id, event.pointDelta])), [events]);
  const summary = applyPendingPointActions({ balance: snapshot.balance, receivedThisWeek: snapshot.receivedThisWeek, redeemedThisWeek: snapshot.redeemedThisWeek }, pendingActions.map((action) => ({ ...action, pointDelta: action.pointDelta ?? (action.kind === "complete" ? taskPoints.get(action.taskId!) : action.kind === "redeem" ? -(rewardCosts.get(action.rewardId!) ?? 0) : -(eventDeltas.get(action.eventId!) ?? 0)) })));

  useEffect(() => {
    if (!navigator.onLine || isOnline !== true || queued > 0 || refreshStarted.current) return;
    refreshStarted.current = true;
    const timer = window.setTimeout(() => router.replace("/"), 250);
    return () => window.clearTimeout(timer);
  }, [isOnline, queued, router]);

  async function submitPointAction(action: Parameters<typeof queue>[0], message: string) {
    const queuedAction = await queue(action);
    const result = await sync(queuedAction.id);
    setNotice(result.status === "synced" ? message : result.status === "offline" ? "Saved for sync when you are back online." : result.reason ?? "Saved for sync when you are back online.");
  }

  async function queueCompletion(taskId: string) { await submitPointAction({ childId: snapshot.childId, kind: "complete", taskId, effectiveDate: snapshot.currentDate, pointDelta: taskPoints.get(taskId) ?? 0 }, "Points added."); }
  async function queueReward(rewardId: string) { await submitPointAction({ childId: snapshot.childId, kind: "redeem", rewardId, pointDelta: -(rewardCosts.get(rewardId) ?? 0) }, "Reward redeemed."); }
  async function queueUndo(eventId: string) { await submitPointAction({ childId: snapshot.childId, kind: "undo", eventId, pointDelta: -(eventDeltas.get(eventId) ?? 0) }, "Task completion undone."); }

  return <main className="workspace-page mx-auto w-full max-w-xl px-5 pb-10 pt-6"><header className="mb-6"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.14em] text-emerald-700"><WifiOff aria-hidden="true" size={17}/>{isOnline === false ? "Saved offline workspace" : "Refreshing saved workspace"}</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{snapshot.childName}&apos;s points</h1><p className="mt-2 text-sm text-slate-500">Saved {snapshot.currentDate} · Management and week navigation need an internet connection.</p><p className="mt-3 text-xs font-semibold text-slate-500">{syncing ? "Syncing points…" : queued ? isOnline === false ? `Offline — ${queued} queued` : `${queued} waiting to sync…` : isOnline === false ? "Offline" : "Saved workspace"}</p></header>
    {notice ? <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900" role="status">{notice}</p> : null}
    <div className="mb-4 grid grid-cols-3 gap-2"><Card className="p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Remaining</p><p className="mt-1 text-2xl font-extrabold text-emerald-700">{summary.balance}</p></Card><Card className="p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Received</p><p className="mt-1 text-2xl font-extrabold text-teal-700">+{summary.receivedThisWeek}</p></Card><Card className="p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Redeemed</p><p className="mt-1 text-2xl font-extrabold text-amber-700">−{summary.redeemedThisWeek}</p></Card></div>
    <section className="grid gap-4"><Card className="p-5"><h2 className="text-lg font-bold text-slate-950">Tasks for today</h2><div className="mt-4 grid grid-cols-2 gap-3">{snapshot.tasks.map((task) => <Button aria-label={`${task.name}: ${task.points} points`} className="flex h-28 flex-col gap-2" key={task.id} onClick={() => void queueCompletion(task.id)} type="button"><TaskIcon aria-hidden="true" name={task.icon as TaskIconName} size={30}/><span>{task.name}</span><small>+{task.points}</small></Button>)}</div></Card>
      <Card className="p-5"><h2 className="text-lg font-bold text-slate-950">Rewards</h2><div className="mt-4 grid gap-2">{snapshot.rewards.map((reward) => <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2" key={reward.id}><span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Gift aria-hidden="true" size={18}/>{reward.name} · {reward.cost}</span><Button onClick={() => void queueReward(reward.id)} size="sm" type="button">Redeem</Button></div>)}</div></Card>
      <Card className="p-5"><h2 className="text-lg font-bold text-slate-950">Recent activity</h2><ol className="mt-3 grid gap-2">{events.map((event) => <li className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 text-sm last:border-0" key={event.id}><span><strong className={event.pointDelta > 0 ? "text-emerald-600" : "text-rose-600"}>{event.pointDelta > 0 ? `+${event.pointDelta}` : event.pointDelta}</strong> {event.taskName ?? event.rewardName ?? "Activity"}</span>{event.eventType === "task_completion" ? <Button onClick={() => void queueUndo(event.id)} size="sm" type="button" variant="ghost"><RotateCcw aria-hidden="true" size={15}/>Undo</Button> : null}</li>)}</ol>{events.length === 0 ? <p className="mt-3 text-sm text-slate-500">No saved activity yet.</p> : null}</Card>
    </section><p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 aria-hidden="true" size={15}/>Point actions are saved safely and sync automatically when online.</p></main>;
}
