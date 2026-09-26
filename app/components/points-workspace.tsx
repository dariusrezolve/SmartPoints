"use client";

import { WorkspaceMenu } from "@/app/components/workspace-menu";
import { OfflineSnapshotWriter } from "@/app/components/offline-snapshot-writer";
import { useOfflineActionSync } from "@/app/components/offline-action-sync";
import { InstallAppTip } from "@/app/components/install-app-tip";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, Gift, Plus, Sparkles, TrendingUp, WalletCards, WifiOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { TaskIcon } from "@/lib/points/task-icons";
import { applyPendingPointActions } from "@/lib/offline/optimistic-summary";
import type { TaskIconName } from "@/lib/points/validation";
import { shiftWeek } from "@/lib/points/validation";
import { formatTimerRemaining } from "@/lib/rewards/timers";

type Child = { id: string; display_name: string };
type Task = { id: string; name: string; points: number; icon: TaskIconName };
type Reward = { id: string; name: string; cost: number; icon: TaskIconName; duration_minutes: number | null };
type RewardTimer = { reward_id: string; ends_at: string };
type Event = { id: string; event_type: string; point_delta: number; effective_date: string; task_id: string | null; reward_id: string | null; reversal_of: string | null };
type PointSummary = { balance: number; receivedThisWeek: number; redeemedThisWeek: number };
type Props = { parentId: string; childId: string; childName: string; childProfiles: Child[]; currentDate: string; currentWeekStart: string; initialManager?: "tasks" | "rewards"; initialNotice?: string; isCurrentWeek: boolean; pointSummary: PointSummary; rewardTimers: RewardTimer[]; taskCatalog: Task[]; tasks: Task[]; rewards: Reward[]; events: Event[]; timeZone: string };
type ToastKind = "task" | "redeem" | "success" | "offline" | "error";

export function PointsWorkspace({ parentId, childId, childName, childProfiles, currentDate, currentWeekStart, initialManager, initialNotice, isCurrentWeek, pointSummary, rewardTimers, taskCatalog, tasks, rewards, events, timeZone }: Props) {
  const taskNames = new Map(taskCatalog.map((task) => [task.id, task.name]));
  const rewardNames = new Map(rewards.map((reward) => [reward.id, reward.name]));
  const router = useRouter();
  const { queue, queued, syncing, sync, pendingActions, isOnline } = useOfflineActionSync(parentId);
  const taskPoints = new Map(tasks.map((task) => [task.id, task.points]));
  const rewardCosts = new Map(rewards.map((reward) => [reward.id, reward.cost]));
  const eventDeltas = new Map(events.map((event) => [event.id, event.point_delta]));
  const optimisticPointSummary = applyPendingPointActions(pointSummary, pendingActions.map((action) => ({
    ...action,
    pointDelta: action.pointDelta ?? (action.kind === "complete" ? taskPoints.get(action.taskId!) : action.kind === "redeem" ? -(rewardCosts.get(action.rewardId!) ?? 0) : -(eventDeltas.get(action.eventId!) ?? 0)),
  })));
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(initialNotice ? { kind: "success", message: initialNotice } : null);
  const toastRef = useRef<HTMLDivElement>(null);
  const [lastTappedTaskId, setLastTappedTaskId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const endedTimerKeys = useRef(new Set<string>());
  const timerEndsAt = new Map(rewardTimers.map((timer) => [timer.reward_id, timer.ends_at]));
  useEffect(() => {
    if (!toast) return;
    const frame = window.requestAnimationFrame(() => {
      if (toastRef.current && !toastRef.current.matches(":popover-open")) toastRef.current.showPopover();
    });
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(timeout); };
  }, [toast]);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  function showToast(kind: ToastKind, message: string) { setToast({ kind, message }); }
  useEffect(() => {
    for (const timer of rewardTimers) {
      if (new Date(timer.ends_at).getTime() > now.getTime() || endedTimerKeys.current.has(timer.ends_at)) continue;
      endedTimerKeys.current.add(timer.ends_at);
      const reward = rewards.find((item) => item.id === timer.reward_id);
      const message = `${reward?.name ?? "Timed reward"} is over.`;
      showToast("redeem", message);
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      oscillator.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.18);
      oscillator.addEventListener("ended", () => void audioContext.close());
      if ("Notification" in window && Notification.permission === "granted") new Notification("SmartPoints timer", { body: message });
    }
  }, [now, rewardTimers, rewards]);
  async function submitPointAction(action: Parameters<typeof queue>[0], successToast: { kind: ToastKind; message: string }) {
    try {
      const queuedAction = await queue(action);
      const result = await sync(queuedAction.id);
      if (result.status === "synced") { showToast(successToast.kind, successToast.message); router.refresh(); return; }
      if (result.status === "offline" || result.status === "queued") { showToast("offline", "Saved for sync when you are back online."); return; }
      showToast("error", `Couldn't add points. ${result.reason ?? "Please try again."}`);
    } catch (caught) {
      showToast("error", `Couldn't add points. ${caught instanceof Error ? caught.message : "Please try again."}`);
    }
  }
  async function queueCompletion(taskId: string) { const points = taskPoints.get(taskId) ?? 0; setLastTappedTaskId(taskId); window.setTimeout(() => setLastTappedTaskId((current) => current === taskId ? null : current), 550); await submitPointAction({ childId, kind: "complete", taskId, effectiveDate: currentDate, pointDelta: points }, { kind: "task", message: `Points added: +${points}.` }); }
  async function queueUndo(eventId: string) { await submitPointAction({ childId, kind: "undo", eventId, pointDelta: -(eventDeltas.get(eventId) ?? 0) }, { kind: "success", message: "Task completion undone." }); }
  async function queueRewardUndo(eventId: string) { await submitPointAction({ childId, kind: "undo_reward", eventId, pointDelta: -(eventDeltas.get(eventId) ?? 0) }, { kind: "success", message: "Reward redemption undone." }); }
  async function queueReward(rewardId: string) { const cost = rewardCosts.get(rewardId) ?? 0; const timerDurationMinutes = rewards.find((reward) => reward.id === rewardId)?.duration_minutes ?? null; await submitPointAction({ childId, kind: "redeem", rewardId, pointDelta: -cost, timerDurationMinutes }, { kind: "redeem", message: `−${cost} points redeemed` }); }

  const offlineEvents = events.map((event) => ({ id: event.id, eventType: event.event_type, pointDelta: event.point_delta, effectiveDate: event.effective_date, taskId: event.task_id, rewardId: event.reward_id, taskName: event.task_id ? taskNames.get(event.task_id) : undefined, rewardName: event.reward_id ? rewardNames.get(event.reward_id) : undefined, icon: event.task_id ? taskCatalog.find((task) => task.id === event.task_id)?.icon : event.reward_id ? rewards.find((reward) => reward.id === event.reward_id)?.icon : undefined }));

  return <main className="workspace-page mx-auto w-full max-w-5xl px-5 pb-10 pt-6"><OfflineSnapshotWriter balance={optimisticPointSummary.balance} childId={childId} childName={childName} currentDate={currentDate} events={offlineEvents} parentId={parentId} receivedThisWeek={optimisticPointSummary.receivedThisWeek} redeemedThisWeek={optimisticPointSummary.redeemedThisWeek} rewards={rewards} tasks={tasks}/>
    {toast ? <div aria-live="polite" className={`fixed left-1/2 top-1/2 z-[100] m-0 w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border-4 border-white px-6 py-5 text-center text-lg font-extrabold text-white shadow-2xl ${toast.kind === "task" || toast.kind === "success" ? "bg-emerald-700" : toast.kind === "redeem" ? "bg-amber-500" : toast.kind === "offline" ? "bg-slate-800" : "bg-rose-700"}`} popover="manual" ref={toastRef} role="status"><span className="flex items-center justify-center gap-3">{toast.kind === "task" || toast.kind === "success" ? <CheckCircle2 aria-hidden="true" size={28}/> : toast.kind === "redeem" ? <Gift aria-hidden="true" size={28}/> : toast.kind === "offline" ? <WifiOff aria-hidden="true" size={28}/> : <CircleAlert aria-hidden="true" size={28}/>}<span>{toast.message}</span></span></div> : null}
    <header className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 sm:text-base"><Sparkles aria-hidden="true" size={17}/>{isCurrentWeek ? currentDate : `Week of ${currentWeekStart}`}</p><h1 className="mt-2 bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-800 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">{childName}&apos;s points</h1><div className="mt-3 flex flex-wrap items-center gap-2"><Link aria-label="Previous week" className="inline-flex h-10 items-center gap-1 rounded-xl border border-emerald-200/90 bg-white/80 px-3 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-emerald-50" href={`/?child=${childId}&week=${shiftWeek(currentWeekStart, -1)}`}><ChevronLeft aria-hidden="true" size={16}/>Previous</Link><Link aria-label="Next week" className="inline-flex h-10 items-center gap-1 rounded-xl border border-emerald-200/90 bg-white/80 px-3 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-emerald-50" href={`/?child=${childId}&week=${shiftWeek(currentWeekStart, 1)}`}>Next<ChevronRight aria-hidden="true" size={16}/></Link>{!isCurrentWeek ? <Link className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 text-sm font-semibold text-white shadow-sm" href={`/?child=${childId}`}><CalendarDays aria-hidden="true" size={15}/>Current week</Link> : null}</div></div>
        <WorkspaceMenu childId={childId} childName={childName} childProfiles={childProfiles} currentWeekStart={currentWeekStart} initialManager={initialManager} pointSummary={optimisticPointSummary} rewards={rewards} selectedTaskIds={new Set(tasks.map((task) => task.id))} taskCatalog={taskCatalog} timeZone={timeZone}/>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><span className={isOnline === false ? "size-2 rounded-full bg-amber-500" : "size-2 rounded-full bg-emerald-500"}/>{syncing ? "Syncing points…" : queued ? isOnline === false ? `Offline — ${queued} queued` : `${queued} waiting to sync…` : isOnline === false ? "Offline" : "Synced"}</div><InstallAppTip/><div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="relative overflow-hidden p-3 sm:p-4"><div className="absolute -right-5 -top-5 size-20 rounded-full bg-emerald-100/70"/><WalletCards aria-hidden="true" className="relative text-emerald-600" size={18}/><p className="relative mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Remaining</p><p className={optimisticPointSummary.balance < 0 ? "relative mt-1 text-2xl font-extrabold text-rose-600" : "relative mt-1 text-2xl font-extrabold text-emerald-700"}>{optimisticPointSummary.balance}</p></Card>
        <Card className="relative overflow-hidden p-3 sm:p-4"><div className="absolute -right-5 -top-5 size-20 rounded-full bg-teal-100/70"/><TrendingUp aria-hidden="true" className="relative text-teal-600" size={18}/><p className="relative mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Received</p><p className="relative mt-1 text-2xl font-extrabold text-teal-700">+{optimisticPointSummary.receivedThisWeek}</p></Card>
        <Card className="relative overflow-hidden p-3 sm:p-4"><div className="absolute -right-5 -top-5 size-20 rounded-full bg-amber-100/70"/><Gift aria-hidden="true" className="relative text-amber-600" size={18}/><p className="relative mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Redeemed</p><p className="relative mt-1 text-2xl font-extrabold text-amber-700">−{optimisticPointSummary.redeemedThisWeek}</p></Card>
      </div>
    </header>

    <section className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold tracking-tight text-slate-950">Tasks for today</h2><Button aria-label="Add a task" asChild size="icon" variant="outline"><Link href={`/?child=${childId}&week=${currentWeekStart}&manage=tasks`}><Plus aria-hidden="true" size={18}/></Link></Button></div><p className="mt-1 text-sm text-slate-500">Tap a task to award points.</p>
        {!isCurrentWeek ? <p className="mt-3 text-sm text-emerald-700">Past and future weeks are view-only.</p> : null}<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{tasks.map((task) => <Button aria-label={`${task.name}: ${task.points} points`} className={lastTappedTaskId === task.id ? "task-tile-pulse group relative flex h-32 w-full flex-col gap-1.5 p-3" : "group relative flex h-32 w-full flex-col gap-1.5 p-3"} disabled={!isCurrentWeek} key={task.id} onClick={() => void queueCompletion(task.id)} title={task.name} type="button"><TaskIcon aria-hidden="true" name={task.icon} size={32}/><small className="text-sm font-bold">+{task.points}</small>{lastTappedTaskId === task.id ? <span className="pointer-events-none absolute -top-3 right-2 animate-bounce text-lg font-black text-white">+{task.points}</span> : null}<span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-48 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 sm:block" role="tooltip">{task.name}</span><span className="line-clamp-2 text-center text-xs font-semibold leading-snug">{task.name}</span></Button>)}</div>
        {tasks.length === 0 ? <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Use Set daily tasks to choose what can be completed.</p> : null}
      </Card>
      <Card className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold tracking-tight text-slate-950">Rewards</h2><Button aria-label="Add a reward" asChild size="icon" variant="outline"><Link href={`/?child=${childId}&week=${currentWeekStart}&manage=rewards`}><Plus aria-hidden="true" size={18}/></Link></Button></div><p className="mt-1 text-sm text-slate-500">Redeem now, even when points go below zero.</p>
        <div className="mt-5 grid gap-2">{rewards.map((reward) => { const endsAt = timerEndsAt.get(reward.id); const timerText = endsAt ? formatTimerRemaining(endsAt, now) : null; return <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-orange-50/40 px-3 py-2.5" key={reward.id}><span className="flex items-center gap-3 text-sm font-semibold text-slate-800"><span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700"><TaskIcon aria-hidden="true" name={reward.icon} size={21}/></span><span>{reward.name}<small className="mt-0.5 block font-medium text-slate-500">{reward.cost} points{reward.duration_minutes ? ` · ${reward.duration_minutes} min` : ""}</small>{timerText ? <strong className={timerText === "Time is up" ? "mt-1 block text-xs text-rose-700" : "mt-1 block text-xs text-amber-800"} role="timer">{timerText}</strong> : null}</span></span><Button className="from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" onClick={() => void queueReward(reward.id)} size="sm" type="button">Redeem</Button></div>; })}</div>
        {rewards.length === 0 ? <p className="mt-5 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Add a reward when you are ready to redeem points.</p> : null}
      </Card>
    </section>
    <Card className="mt-4 p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Recent activity</h2>{events.length ? <ol className="mt-4 grid max-h-[31rem] gap-2 overflow-y-auto pr-1">{events.map((event) => { const name = event.task_id ? taskNames.get(event.task_id) : event.reward_id ? rewardNames.get(event.reward_id) : "Activity"; const icon = event.task_id ? taskCatalog.find((task) => task.id === event.task_id)?.icon : event.reward_id ? rewards.find((reward) => reward.id === event.reward_id)?.icon : "CircleCheck"; return <li className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2 text-sm last:border-0" key={event.id}><span className="flex items-center gap-3"><span className={event.point_delta > 0 ? "grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700" : "grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-700"}><TaskIcon aria-hidden="true" name={icon ?? "CircleCheck"} size={20}/></span><span><strong className={event.point_delta > 0 ? "text-emerald-600" : "text-rose-600"}>{event.point_delta > 0 ? `+${event.point_delta}` : event.point_delta}</strong> <span className="font-medium text-slate-800">{name}</span> <small className="text-slate-500">· {event.effective_date}</small></span></span>{event.event_type === "task_completion" || event.event_type === "reward_redemption" ? <Button onClick={() => void (event.event_type === "task_completion" ? queueUndo(event.id) : queueRewardUndo(event.id))} size="sm" type="button" variant="ghost">Undo</Button> : null}</li>; })}</ol> : <p className="mt-3 text-sm text-slate-500">No points activity yet.</p>}</Card>
  </main>;
}
