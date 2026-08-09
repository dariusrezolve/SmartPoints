"use client";

import { WorkspaceMenu } from "@/app/components/workspace-menu";
import { OfflineSnapshotWriter } from "@/app/components/offline-snapshot-writer";
import { useOfflineActionSync } from "@/app/components/offline-action-sync";
import { InstallAppTip } from "@/app/components/install-app-tip";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, CircleAlert, WifiOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { TaskIcon } from "@/lib/points/task-icons";
import { applyPendingPointActions } from "@/lib/offline/optimistic-summary";
import type { TaskIconName } from "@/lib/points/validation";
import { shiftWeek } from "@/lib/points/validation";

type Child = { id: string; display_name: string };
type Task = { id: string; name: string; points: number; icon: TaskIconName };
type Reward = { id: string; name: string; cost: number; icon: TaskIconName };
type Event = { id: string; event_type: string; point_delta: number; effective_date: string; task_id: string | null; reward_id: string | null; reversal_of: string | null };
type PointSummary = { balance: number; receivedThisWeek: number; redeemedThisWeek: number };
type Props = { parentId: string; childId: string; childName: string; childProfiles: Child[]; currentDate: string; currentWeekStart: string; isCurrentWeek: boolean; pointSummary: PointSummary; taskCatalog: Task[]; tasks: Task[]; rewards: Reward[]; events: Event[]; timeZone: string };

export function PointsWorkspace({ parentId, childId, childName, childProfiles, currentDate, currentWeekStart, isCurrentWeek, pointSummary, taskCatalog, tasks, rewards, events, timeZone }: Props) {
  const taskNames = new Map(taskCatalog.map((task) => [task.id, task.name]));
  const rewardNames = new Map(rewards.map((reward) => [reward.id, reward.name]));
  const router = useRouter();
  const { queue, queued, syncing, sync, needsAttention, pendingActions, isOnline, discard } = useOfflineActionSync(parentId);
  const taskPoints = new Map(tasks.map((task) => [task.id, task.points]));
  const rewardCosts = new Map(rewards.map((reward) => [reward.id, reward.cost]));
  const eventDeltas = new Map(events.map((event) => [event.id, event.point_delta]));
  const optimisticPointSummary = applyPendingPointActions(pointSummary, pendingActions.map((action) => ({
    ...action,
    pointDelta: action.pointDelta ?? (action.kind === "complete" ? taskPoints.get(action.taskId!) : action.kind === "redeem" ? -(rewardCosts.get(action.rewardId!) ?? 0) : -(eventDeltas.get(action.eventId!) ?? 0)),
  })));
  const [toast, setToast] = useState<{ kind: "success" | "offline" | "error"; message: string } | null>(null);
  const [lastTappedTaskId, setLastTappedTaskId] = useState<string | null>(null);
  function showToast(kind: "success" | "offline" | "error", message: string) { setToast({ kind, message }); window.setTimeout(() => setToast(null), 3500); }
  async function submitPointAction(action: Parameters<typeof queue>[0], successMessage: string) {
    try {
      const queuedAction = await queue(action);
      const result = await sync(queuedAction.id);
      if (result.status === "synced") { showToast("success", successMessage); router.refresh(); return; }
      if (result.status === "offline" || result.status === "queued") { showToast("offline", "Saved for sync when you are back online."); return; }
      showToast("error", `Couldn't add points. ${result.reason ?? "Please try again."}`);
    } catch (caught) {
      showToast("error", `Couldn't add points. ${caught instanceof Error ? caught.message : "Please try again."}`);
    }
  }
  async function queueCompletion(taskId: string) { const points = taskPoints.get(taskId) ?? 0; setLastTappedTaskId(taskId); window.setTimeout(() => setLastTappedTaskId((current) => current === taskId ? null : current), 550); await submitPointAction({ childId, kind: "complete", taskId, effectiveDate: currentDate, pointDelta: points }, `Points added: +${points}.`); }
  async function queueUndo(eventId: string) { await submitPointAction({ childId, kind: "undo", eventId, pointDelta: -(eventDeltas.get(eventId) ?? 0) }, "Task completion undone."); }
  async function queueReward(rewardId: string) { await submitPointAction({ childId, kind: "redeem", rewardId, pointDelta: -(rewardCosts.get(rewardId) ?? 0) }, "Reward redeemed."); }

  return <main className="workspace-page mx-auto w-full max-w-5xl px-5 pb-10 pt-6"><OfflineSnapshotWriter balance={optimisticPointSummary.balance} childId={childId} childName={childName} currentDate={currentDate} parentId={parentId} receivedThisWeek={optimisticPointSummary.receivedThisWeek} redeemedThisWeek={optimisticPointSummary.redeemedThisWeek} rewards={rewards} tasks={tasks}/>
    {toast ? <div aria-live="polite" className={`fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.kind === "success" ? "bg-emerald-600" : toast.kind === "offline" ? "bg-sky-700" : "bg-rose-600"}`} role="status">{toast.kind === "success" ? <CheckCircle2 aria-hidden="true" size={20}/> : toast.kind === "offline" ? <WifiOff aria-hidden="true" size={20}/> : <CircleAlert aria-hidden="true" size={20}/>}<span>{toast.message}</span></div> : null}
    <header className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">{isCurrentWeek ? currentDate : `Week of ${currentWeekStart}`}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{childName}&apos;s points</h1><div className="mt-3 flex items-center gap-2"><Link className="rounded-lg border border-emerald-200 bg-white px-3 py-1 text-sm font-semibold text-emerald-700" href={`/?child=${childId}&week=${shiftWeek(currentWeekStart, -1)}`}>← Previous</Link><Link className="rounded-lg border border-emerald-200 bg-white px-3 py-1 text-sm font-semibold text-emerald-700" href={`/?child=${childId}&week=${shiftWeek(currentWeekStart, 1)}`}>Next →</Link></div></div>
        <WorkspaceMenu childId={childId} childName={childName} childProfiles={childProfiles} currentWeekStart={currentWeekStart} pointSummary={optimisticPointSummary} rewards={rewards} selectedTaskIds={new Set(tasks.map((task) => task.id))} taskCatalog={taskCatalog} timeZone={timeZone}/>
      </div>
      <div className="mt-3 text-xs font-semibold text-slate-500">{syncing ? "Syncing points…" : queued ? isOnline === false ? `Offline — ${queued} queued` : `${queued} waiting to sync…` : isOnline === false ? "Offline" : "Synced"}</div><InstallAppTip/><div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Remaining</p><p className={optimisticPointSummary.balance < 0 ? "mt-1 text-2xl font-bold text-rose-600" : "mt-1 text-2xl font-bold text-emerald-600"}>{optimisticPointSummary.balance}</p></Card>
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Received this week</p><p className="mt-1 text-2xl font-bold text-sky-700">+{optimisticPointSummary.receivedThisWeek}</p></Card>
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Redeemed this week</p><p className="mt-1 text-2xl font-bold text-rose-600">−{optimisticPointSummary.redeemedThisWeek}</p></Card>
      </div>
    </header>

    <section className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Tasks for today</h2><p className="mt-1 text-sm text-slate-500">Tap a task to award points.</p>
        {!isCurrentWeek ? <p className="mt-3 text-sm text-emerald-700">Past and future weeks are view-only.</p> : null}<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{tasks.map((task) => <Button aria-label={`${task.name}: ${task.points} points`} className={lastTappedTaskId === task.id ? "task-tile-pulse group relative flex h-28 w-full flex-col gap-2 p-3 sm:h-24" : "group relative flex h-28 w-full flex-col gap-2 p-3 sm:h-24"} disabled={!isCurrentWeek} key={task.id} onClick={() => void queueCompletion(task.id)} title={task.name} type="button"><TaskIcon aria-hidden="true" name={task.icon} size={34}/><small className="text-sm font-bold">+{task.points}</small>{lastTappedTaskId === task.id ? <span className="pointer-events-none absolute -top-3 right-2 animate-bounce text-lg font-black text-white">+{task.points}</span> : null}<span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-48 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 sm:block" role="tooltip">{task.name}</span><span className="text-xs font-semibold sm:hidden">{task.name}</span></Button>)}</div>
        {tasks.length === 0 ? <p className="mt-5 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">Use Set Daily tasks to choose what can be completed this week.</p> : null}
      </Card>
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Rewards</h2><p className="mt-1 text-sm text-slate-500">Redeem now, even when points go below zero.</p>
        <div className="mt-5 grid gap-2">{rewards.map((reward) => <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2" key={reward.id}><span className="flex items-center gap-3 text-sm font-semibold text-slate-800"><span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700"><TaskIcon aria-hidden="true" name={reward.icon} size={21}/></span><span>{reward.name}<small className="mt-0.5 block font-medium text-slate-500">{reward.cost} points</small></span></span><Button onClick={() => void queueReward(reward.id)} size="sm" type="button">Redeem</Button></div>)}</div>
        {rewards.length === 0 ? <p className="mt-5 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">Add a reward when you are ready to redeem points.</p> : null}
      </Card>
    </section>
    <Card className="mt-4 p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Recent activity</h2>{events.length ? <ol className="mt-4 grid max-h-[31rem] gap-2 overflow-y-auto pr-1">{events.map((event) => { const name = event.task_id ? taskNames.get(event.task_id) : event.reward_id ? rewardNames.get(event.reward_id) : "Activity"; const icon = event.task_id ? taskCatalog.find((task) => task.id === event.task_id)?.icon : event.reward_id ? rewards.find((reward) => reward.id === event.reward_id)?.icon : "CircleCheck"; return <li className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2 text-sm last:border-0" key={event.id}><span className="flex items-center gap-3"><span className={event.point_delta > 0 ? "grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700" : "grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-700"}><TaskIcon aria-hidden="true" name={icon ?? "CircleCheck"} size={20}/></span><span><strong className={event.point_delta > 0 ? "text-emerald-600" : "text-rose-600"}>{event.point_delta > 0 ? `+${event.point_delta}` : event.point_delta}</strong> <span className="font-medium text-slate-800">{name}</span> <small className="text-slate-500">· {event.effective_date}</small></span></span>{event.event_type === "task_completion" ? <Button onClick={() => void queueUndo(event.id)} size="sm" type="button" variant="ghost">Undo</Button> : null}</li>; })}</ol> : <p className="mt-3 text-sm text-slate-500">No points activity yet.</p>}{needsAttention.length ? <section className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3"><h3 className="font-semibold text-rose-900">Needs attention</h3>{needsAttention.map((action) => <div className="mt-2 flex items-center justify-between gap-2 text-sm text-rose-800" key={action.id}><span>{action.reason ?? "This action could not be saved."}</span><Button onClick={() => void discard(action.id)} size="sm" type="button" variant="outline">Discard</Button></div>)}</section> : null}</Card>
  </main>;
}
