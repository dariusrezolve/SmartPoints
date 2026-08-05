"use client";

import { completeTask, redeemReward, undoTaskCompletion } from "@/app/points/actions";
import { WorkspaceMenu } from "@/app/components/workspace-menu";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { TaskIcon } from "@/lib/points/task-icons";
import type { TaskIconName } from "@/lib/points/validation";

type Child = { id: string; display_name: string };
type Task = { id: string; name: string; points: number; icon: TaskIconName };
type Reward = { id: string; name: string; cost: number };
type Event = { id: string; event_type: string; point_delta: number; effective_date: string; task_id: string | null; reward_id: string | null; reversal_of: string | null };
type PointSummary = { balance: number; receivedThisWeek: number; redeemedThisWeek: number };
type Props = { childId: string; childName: string; childProfiles: Child[]; currentDate: string; currentWeekStart: string; pointSummary: PointSummary; taskCatalog: Task[]; tasks: Task[]; rewards: Reward[]; events: Event[]; timeZone: string };

export function PointsWorkspace({ childId, childName, childProfiles, currentDate, currentWeekStart, pointSummary, taskCatalog, tasks, rewards, events, timeZone }: Props) {
  const taskNames = new Map(taskCatalog.map((task) => [task.id, task.name]));
  const rewardNames = new Map(rewards.map((reward) => [reward.id, reward.name]));

  return <main className="workspace-page mx-auto w-full max-w-5xl px-5 pb-10 pt-6">
    <header className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">{currentDate}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{childName}&apos;s points</h1></div>
        <WorkspaceMenu childId={childId} childName={childName} childProfiles={childProfiles} currentWeekStart={currentWeekStart} pointSummary={pointSummary} selectedTaskIds={new Set(tasks.map((task) => task.id))} taskCatalog={taskCatalog} timeZone={timeZone}/>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Remaining</p><p className={pointSummary.balance < 0 ? "mt-1 text-2xl font-bold text-rose-600" : "mt-1 text-2xl font-bold text-emerald-600"}>{pointSummary.balance}</p></Card>
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Received this week</p><p className="mt-1 text-2xl font-bold text-sky-700">+{pointSummary.receivedThisWeek}</p></Card>
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Redeemed this week</p><p className="mt-1 text-2xl font-bold text-rose-600">−{pointSummary.redeemedThisWeek}</p></Card>
      </div>
    </header>

    <section className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Tasks for today</h2><p className="mt-1 text-sm text-slate-500">Tap a task to award points.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{tasks.map((task) => <form action={completeTask} key={task.id}><input name="childId" type="hidden" value={childId}/><input name="taskId" type="hidden" value={task.id}/><input name="effectiveDate" type="hidden" value={currentDate}/><Button aria-label={`${task.name}: ${task.points} points`} className="group relative flex h-24 w-full flex-col gap-2 p-3" title={task.name} type="submit"><TaskIcon aria-hidden="true" name={task.icon} size={34}/><small className="text-sm font-bold">+{task.points}</small><span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-48 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100" role="tooltip">{task.name}</span></Button></form>)}</div>
        {tasks.length === 0 ? <p className="mt-5 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">Use Set Daily tasks to choose what can be completed this week.</p> : null}
      </Card>
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Rewards</h2><p className="mt-1 text-sm text-slate-500">Redeem now, even when points go below zero.</p>
        <div className="mt-5 grid gap-2">{rewards.map((reward) => <form action={redeemReward} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2" key={reward.id}><input name="childId" type="hidden" value={childId}/><input name="rewardId" type="hidden" value={reward.id}/><span className="text-sm font-semibold text-slate-800">{reward.name}<small className="mt-0.5 block font-medium text-slate-500">{reward.cost} points</small></span><Button size="sm" type="submit">Redeem</Button></form>)}</div>
        {rewards.length === 0 ? <p className="mt-5 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">Add a reward when you are ready to redeem points.</p> : null}
      </Card>
    </section>
    <Card className="mt-4 p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Recent activity</h2>{events.length ? <ol className="mt-4 grid gap-2">{events.map((event) => { const name = event.task_id ? taskNames.get(event.task_id) : event.reward_id ? rewardNames.get(event.reward_id) : "Activity"; return <li className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2 text-sm last:border-0" key={event.id}><span><strong className={event.point_delta > 0 ? "text-emerald-600" : "text-rose-600"}>{event.point_delta > 0 ? `+${event.point_delta}` : event.point_delta}</strong> <span className="font-medium text-slate-800">{name}</span> <small className="text-slate-500">· {event.effective_date}</small></span>{event.event_type === "task_completion" ? <form action={undoTaskCompletion}><input name="childId" type="hidden" value={childId}/><input name="eventId" type="hidden" value={event.id}/><Button size="sm" type="submit" variant="ghost">Undo</Button></form> : null}</li>; })}</ol> : <p className="mt-3 text-sm text-slate-500">No points activity yet.</p>}</Card>
  </main>;
}
