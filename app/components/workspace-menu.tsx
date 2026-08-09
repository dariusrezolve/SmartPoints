"use client";

import Link from "next/link";
import { BarChart3, CalendarCheck2, ChevronDown, Gift, ListTodo, LogOut, Menu as MenuIcon, Plus, RotateCcw, Share2, Users, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { archiveChild, createChild, renameChild, updateHouseholdTimeZone } from "@/app/children/actions";
import { archiveReward, archiveTask, createReward, createTask, resetWeeklyPoints, setWeeklyTasks, updateReward, updateTask } from "@/app/points/actions";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { TaskIcon } from "@/lib/points/task-icons";
import { starterTasks, taskIconNames, type TaskIconName } from "@/lib/points/validation";
import { clearOfflineSnapshots } from "@/lib/offline/storage";
import { createInvitation } from "@/app/invitations/actions";

type Child = { id: string; display_name: string };
type Task = { id: string; name: string; points: number; icon: TaskIconName };
type Reward = { id: string; name: string; cost: number; icon: TaskIconName };
type ModalName = "task" | "reward" | "dailyTasks" | "family" | "resetWeek" | "share" | null;
type ManagerName = "tasks" | "rewards";
type PointSummary = { balance: number; receivedThisWeek: number; redeemedThisWeek: number };

type Props = { childId: string; childName: string; childProfiles: Child[]; currentWeekStart: string; initialManager?: ManagerName; pointSummary: PointSummary; rewards: Reward[]; selectedTaskIds: Set<string>; taskCatalog: Task[]; timeZone: string };

function setBrowserTimeZone(event: FormEvent<HTMLFormElement>) {
  const timeZoneField = event.currentTarget.elements.namedItem("timeZone");
  if (timeZoneField instanceof HTMLInputElement) timeZoneField.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function WorkspaceModal({ active, children, onClose, title }: { active: boolean; children: ReactNode; onClose: () => void; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) dialog.showModal();
    if (!active && dialog.open) dialog.close();
  }, [active]);

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return <dialog aria-label={title} className="fixed inset-0 h-full w-full max-w-none border-0 bg-transparent p-4 backdrop:bg-emerald-950/30" onClick={closeOnBackdrop} onClose={onClose} ref={dialogRef}>
    <Card className="mx-auto mt-[8vh] max-h-[84vh] w-full max-w-lg overflow-y-auto p-5 shadow-2xl shadow-emerald-950/15 sm:mt-[14vh] sm:p-6">
      <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold tracking-tight text-slate-950">{title}</h2><Button aria-label={`Close ${title}`} onClick={onClose} size="icon" type="button" variant="ghost">×</Button></div>
      {children}
    </Card>
  </dialog>;
}

export function WorkspaceMenu({ childId, childName, childProfiles, currentWeekStart, initialManager, pointSummary, rewards, selectedTaskIds, taskCatalog, timeZone }: Props) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [activeModal, setActiveModal] = useState<ModalName>(initialManager === "tasks" ? "task" : initialManager === "rewards" ? "reward" : null);
  const [selectedIcon, setSelectedIcon] = useState<TaskIconName>("CircleCheck");
  const [selectedRewardIcon, setSelectedRewardIcon] = useState<TaskIconName>("Star");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [selectedEditTaskIcon, setSelectedEditTaskIcon] = useState<TaskIconName>("CircleCheck");
  const [selectedEditRewardIcon, setSelectedEditRewardIcon] = useState<TaskIconName>("Star");
  const [dailyTaskIds, setDailyTaskIds] = useState(() => new Set(selectedTaskIds));

  useEffect(() => {
    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && menuRef.current && !menuRef.current.contains(event.target)) menuRef.current.open = false;
    };
    document.addEventListener("pointerdown", closeOnOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
  }, []);

  useEffect(() => {
    if (!initialManager) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("manage");
    window.history.replaceState(null, "", url);
  }, [initialManager]);

  function openModal(modal: Exclude<ModalName, null>) {
    if (menuRef.current) menuRef.current.open = false;
    if (modal === "dailyTasks") setDailyTaskIds(new Set(selectedTaskIds));
    setActiveModal(modal);
  }

  function switchModal(modal: Exclude<ModalName, null>) {
    setActiveModal(null);
    window.requestAnimationFrame(() => setActiveModal(modal));
  }

  return <>
    <details className="group relative" ref={menuRef}>
      <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-white/80 bg-white/85 px-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md [&::-webkit-details-marker]:hidden"><span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">{childName.slice(0, 1).toUpperCase()}</span><MenuIcon aria-hidden="true" size={17}/>Menu <ChevronDown aria-hidden="true" className="text-slate-400 transition group-open:rotate-180" size={15}/></summary>
      <Card className="absolute right-0 z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] p-2.5 shadow-2xl shadow-emerald-950/15" role="menu">
        <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Your family</p>
        {childProfiles.map((child) => <Link aria-current={child.id === childId ? "page" : undefined} className={child.id === childId ? "mb-1 block rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-900" : "mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50/70"} href={`/?child=${child.id}`} key={child.id} role="menuitem">{child.display_name}</Link>)}
        <Button className="w-full justify-start" onClick={() => openModal("family")} role="menuitem" size="sm" type="button" variant="ghost"><Users aria-hidden="true" size={16}/>Manage family</Button>
        <Button className="w-full justify-start" onClick={() => openModal("share")} role="menuitem" size="sm" type="button" variant="ghost"><Share2 aria-hidden="true" size={16}/>Share access</Button>
        <div className="my-2 border-t border-emerald-100"/>
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Workspace</p>
        <Button asChild className="w-full justify-start" role="menuitem" size="sm" variant="ghost"><Link href={`/statistics?child=${childId}`}><BarChart3 aria-hidden="true" size={16}/>Statistics</Link></Button>
        <Button className="w-full justify-start" onClick={() => openModal("task")} role="menuitem" size="sm" type="button" variant="ghost"><ListTodo aria-hidden="true" size={16}/>Edit tasks</Button>
        <Button className="w-full justify-start" onClick={() => openModal("reward")} role="menuitem" size="sm" type="button" variant="ghost"><Gift aria-hidden="true" size={16}/>Edit rewards</Button>
        <Button className="w-full justify-start" onClick={() => openModal("dailyTasks")} role="menuitem" size="sm" type="button" variant="ghost"><CalendarCheck2 aria-hidden="true" size={16}/>Set daily tasks</Button>
        <div className="my-2 border-t border-emerald-100"/>
        <Button className="w-full justify-start text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={() => openModal("resetWeek")} role="menuitem" size="sm" type="button" variant="ghost"><RotateCcw aria-hidden="true" size={16}/>Reset this week</Button>
        <div className="my-2 border-t border-emerald-100"/>
        <form action="/auth/sign-out" method="post" onSubmit={() => { void clearOfflineSnapshots(); }}><Button className="w-full justify-start" role="menuitem" size="sm" type="submit" variant="ghost"><LogOut aria-hidden="true" size={16}/>Sign out</Button></form>
      </Card>
    </details>

    <WorkspaceModal active={activeModal === "task"} onClose={() => setActiveModal(null)} title="Edit tasks">
      <p className="mt-2 text-sm text-slate-500">Update a task&apos;s name, points, or icon. Archiving removes it from daily tasks and keeps past points intact.</p>
      <section className="mt-5 grid gap-2">{taskCatalog.map((task) => <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2" key={task.id}><span className="flex items-center gap-3"><TaskIcon aria-hidden="true" name={task.icon} size={24}/><span><strong className="block text-sm text-slate-900">{task.name}</strong><small className="text-slate-500">+{task.points} points</small></span></span><span className="flex gap-1"><Button onClick={() => { setSelectedEditTaskIcon(task.icon); setEditingTask(task); }} size="sm" type="button" variant="outline">Edit</Button><Button onClick={() => setTaskToDelete(task)} size="sm" type="button" variant="ghost">Delete</Button></span></article>)}</section>
      {taskCatalog.length === 0 ? <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">No active tasks yet. Create one below.</p> : null}
      <section className="mt-6 border-t border-slate-200 pt-5"><h3 className="text-sm font-semibold text-slate-900">Create a task</h3><p className="mt-1 text-sm text-slate-500">Add a starter task or make one just for {childName}.</p><div className="mt-4 flex flex-wrap gap-2">{starterTasks.map((task) => <form action={createTask} key={task.name}><input name="childId" type="hidden" value={childId}/><input name="name" type="hidden" value={task.name}/><input name="points" type="hidden" value={task.points}/><input name="icon" type="hidden" value={task.icon}/><input name="starterKey" type="hidden" value={task.name.toLowerCase().replaceAll(" ", "-")}/><Button size="sm" type="submit" variant="outline"><TaskIcon aria-hidden="true" name={task.icon} size={16}/>Add {task.name} (+{task.points})</Button></form>)}</div>
      <form action={createTask} className="mt-5 grid gap-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end"><input name="childId" type="hidden" value={childId}/><input name="icon" type="hidden" value={selectedIcon}/><label className="grid gap-1 text-sm font-medium text-slate-700">Name<Input maxLength={80} name="name" required/></label><label className="grid gap-1 text-sm font-medium text-slate-700">Points<Input min="1" name="points" required type="number"/></label><Button type="submit">Create task</Button><fieldset className="sm:col-span-3"><legend className="text-sm font-medium text-slate-700">Icon</legend><div className="mt-2 flex flex-wrap gap-2">{taskIconNames.map((icon) => <Button aria-label={`Use ${icon} icon`} aria-pressed={selectedIcon === icon} className={selectedIcon === icon ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100" : undefined} key={icon} onClick={() => setSelectedIcon(icon)} size="icon" type="button" variant="outline"><TaskIcon aria-hidden="true" name={icon} size={19}/></Button>)}</div></fieldset></form></section>
    </WorkspaceModal>

    <WorkspaceModal active={activeModal === "reward"} onClose={() => setActiveModal(null)} title="Edit rewards">
      <p className="mt-2 text-sm text-slate-500">Rewards are reusable and can be redeemed before points are earned.</p>
      <section className="mt-5 grid gap-2">{rewards.map((reward) => <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2" key={reward.id}><span className="flex items-center gap-3"><TaskIcon aria-hidden="true" name={reward.icon} size={24}/><span><strong className="block text-sm text-slate-900">{reward.name}</strong><small className="text-slate-500">{reward.cost} points</small></span></span><span className="flex gap-1"><Button onClick={() => { setSelectedEditRewardIcon(reward.icon); setEditingReward(reward); }} size="sm" type="button" variant="outline">Edit</Button><Button onClick={() => setRewardToDelete(reward)} size="sm" type="button" variant="ghost">Delete</Button></span></article>)}</section>
      {rewards.length === 0 ? <p className="mt-5 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">No rewards yet. Create one below.</p> : null}
      <section className="mt-6 border-t border-slate-200 pt-5"><h3 className="text-sm font-semibold text-slate-900">Create a reward</h3><form action={createReward} className="mt-4 grid gap-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end"><input name="childId" type="hidden" value={childId}/><input name="icon" type="hidden" value={selectedRewardIcon}/><label className="grid gap-1 text-sm font-medium text-slate-700">Name<Input maxLength={80} name="name" required/></label><label className="grid gap-1 text-sm font-medium text-slate-700">Cost<Input min="1" name="cost" required type="number"/></label><Button type="submit">Create reward</Button><fieldset className="sm:col-span-3"><legend className="text-sm font-medium text-slate-700">Icon</legend><div className="mt-2 flex flex-wrap gap-2">{taskIconNames.map((icon) => <Button aria-label={`Use ${icon} reward icon`} aria-pressed={selectedRewardIcon === icon} className={selectedRewardIcon === icon ? "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-100" : undefined} key={icon} onClick={() => setSelectedRewardIcon(icon)} size="icon" type="button" variant="outline"><TaskIcon aria-hidden="true" name={icon} size={19}/></Button>)}</div></fieldset></form></section>
    </WorkspaceModal>

    <WorkspaceModal active={editingTask !== null} onClose={() => setEditingTask(null)} title="Edit task">
      {editingTask ? <form action={updateTask} className="mt-5 grid gap-4" onSubmit={() => setEditingTask(null)}><input name="childId" type="hidden" value={childId}/><input name="taskId" type="hidden" value={editingTask.id}/><label>Name<Input defaultValue={editingTask.name} maxLength={80} name="name" required/></label><label>Points<Input defaultValue={editingTask.points} min="1" name="points" required type="number"/></label><label>Icon<div className="mt-1 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700"><TaskIcon aria-label={`Selected ${selectedEditTaskIcon} icon`} name={selectedEditTaskIcon} size={23}/></span><select className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" name="icon" onChange={(event) => setSelectedEditTaskIcon(event.currentTarget.value as TaskIconName)} value={selectedEditTaskIcon}>{taskIconNames.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></div></label><Button type="submit">Save task</Button></form> : null}
    </WorkspaceModal>

    <WorkspaceModal active={editingReward !== null} onClose={() => setEditingReward(null)} title="Edit reward">
      {editingReward ? <form action={updateReward} className="mt-5 grid gap-4" onSubmit={() => setEditingReward(null)}><input name="childId" type="hidden" value={childId}/><input name="rewardId" type="hidden" value={editingReward.id}/><label>Name<Input defaultValue={editingReward.name} maxLength={80} name="name" required/></label><label>Cost<Input defaultValue={editingReward.cost} min="1" name="cost" required type="number"/></label><label>Icon<div className="mt-1 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700"><TaskIcon aria-label={`Selected ${selectedEditRewardIcon} icon`} name={selectedEditRewardIcon} size={23}/></span><select className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" name="icon" onChange={(event) => setSelectedEditRewardIcon(event.currentTarget.value as TaskIconName)} value={selectedEditRewardIcon}>{taskIconNames.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></div></label><Button type="submit">Save reward</Button></form> : null}
    </WorkspaceModal>

    <WorkspaceModal active={taskToDelete !== null} onClose={() => setTaskToDelete(null)} title="Delete task?">
      {taskToDelete ? <><p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">Delete {taskToDelete.name}? It will be removed from daily tasks. Past points will remain in history.</p><div className="mt-5 flex justify-end gap-2"><Button onClick={() => setTaskToDelete(null)} type="button" variant="outline">Cancel</Button><form action={archiveTask} onSubmit={() => setTaskToDelete(null)}><input name="childId" type="hidden" value={childId}/><input name="taskId" type="hidden" value={taskToDelete.id}/><Button type="submit" variant="destructive">Delete task</Button></form></div></> : null}
    </WorkspaceModal>

    <WorkspaceModal active={rewardToDelete !== null} onClose={() => setRewardToDelete(null)} title="Delete reward?">
      {rewardToDelete ? <><p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">Delete {rewardToDelete.name}? Past redemptions will remain in history.</p><div className="mt-5 flex justify-end gap-2"><Button onClick={() => setRewardToDelete(null)} type="button" variant="outline">Cancel</Button><form action={archiveReward} onSubmit={() => setRewardToDelete(null)}><input name="childId" type="hidden" value={childId}/><input name="rewardId" type="hidden" value={rewardToDelete.id}/><Button type="submit" variant="destructive">Delete reward</Button></form></div></> : null}
    </WorkspaceModal>

    <WorkspaceModal active={activeModal === "share"} onClose={() => setActiveModal(null)} title="Share access">
      <p className="mt-2 text-sm text-slate-600">Create a one-time link for another parent. It is valid for seven days and only works with this email address.</p><form className="mt-5 grid gap-3" onSubmit={async (event) => { event.preventDefault(); setShareLink(await createInvitation(new FormData(event.currentTarget))); }}><input name="childId" type="hidden" value={childId}/><label>Email address<Input name="email" required type="email"/></label><Button type="submit">Create share link</Button></form>{shareLink ? <div className="mt-4 rounded-xl bg-emerald-50 p-3"><p className="break-all text-xs text-emerald-950">{shareLink}</p><Button className="mt-3" onClick={() => void navigator.clipboard.writeText(shareLink)} size="sm" type="button" variant="outline">Copy link</Button></div> : null}
    </WorkspaceModal>

    <WorkspaceModal active={activeModal === "dailyTasks"} onClose={() => setActiveModal(null)} title="Set daily tasks">
      <p className="mt-2 text-sm text-slate-500">Choose the tasks that should be available every day. Tap once to add; each task can appear only once.</p>
      <Button className="mt-4" onClick={() => switchModal("task")} size="sm" type="button" variant="outline"><Plus aria-hidden="true" size={16}/>Create a new task</Button>
      <form action={setWeeklyTasks} className="mt-6"><input name="childId" type="hidden" value={childId}/><input name="weekStart" type="hidden" value={currentWeekStart}/>
        <section><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-slate-900">Available tasks</h3><span className="text-xs font-semibold text-slate-400">Tap to add</span></div>
          <div className="mt-3 grid grid-cols-2 gap-2">{taskCatalog.filter((task) => !dailyTaskIds.has(task.id)).map((task) => <Button className="h-auto min-h-20 flex-col gap-1.5 px-3 py-3 text-center" key={task.id} onClick={() => setDailyTaskIds((current) => { if (current.has(task.id)) return current; const next = new Set(current); next.add(task.id); return next; })} type="button" variant="outline"><span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><TaskIcon aria-hidden="true" name={task.icon} size={20}/></span><span className="line-clamp-2 leading-snug">{task.name}</span><small className="font-bold text-emerald-700">+{task.points}</small></Button>)}</div>
          {taskCatalog.length > 0 && taskCatalog.every((task) => dailyTaskIds.has(task.id)) ? <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">All available tasks are in the daily list.</p> : null}
        </section>
        <section className="mt-6 border-t border-emerald-100 pt-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-slate-900">Daily list</h3><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{dailyTaskIds.size}</span></div>
          <div className="mt-3 grid gap-2">{taskCatalog.filter((task) => dailyTaskIds.has(task.id)).map((task) => <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50/60 px-3 py-2.5" key={task.id}><input name="taskId" type="hidden" value={task.id}/><span className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><TaskIcon aria-hidden="true" name={task.icon} size={20}/></span><span className="min-w-0"><strong className="block truncate text-sm text-slate-900">{task.name}</strong><small className="font-semibold text-emerald-700">+{task.points} points</small></span></span><Button aria-label={`Remove ${task.name}`} className="shrink-0 text-slate-500 hover:bg-white hover:text-rose-700" onClick={() => setDailyTaskIds((current) => { const next = new Set(current); next.delete(task.id); return next; })} size="icon" type="button" variant="ghost"><X aria-hidden="true" size={18}/></Button></div>)}</div>
          {dailyTaskIds.size === 0 ? <div className="mt-3 grid place-items-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center"><Plus aria-hidden="true" className="text-emerald-500" size={22}/><p className="mt-2 text-sm font-semibold text-slate-700">Your daily list is empty</p><p className="mt-1 text-xs text-slate-500">Tap an available task to add it.</p></div> : null}
        </section>
        {taskCatalog.length === 0 ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Create a task first, then add it to the daily list.</p> : <Button className="mt-5 w-full" type="submit">Save daily list</Button>}
      </form>
    </WorkspaceModal>

    <WorkspaceModal active={activeModal === "resetWeek"} onClose={() => setActiveModal(null)} title="Reset this week">
      <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">This replaces this week&apos;s displayed balance, received points, redeemed points, and activity. New activity will start from these values.</p>
      <form action={resetWeeklyPoints} className="mt-5 grid gap-4"><input name="childId" type="hidden" value={childId}/><label className="grid gap-1 text-sm font-medium text-slate-700">Remaining points<Input defaultValue={pointSummary.balance} name="remainingPoints" required type="number"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-sm font-medium text-slate-700">Received this week<Input defaultValue={pointSummary.receivedThisWeek} min="0" name="receivedPoints" required type="number"/></label><label className="grid gap-1 text-sm font-medium text-slate-700">Redeemed this week<Input defaultValue={pointSummary.redeemedThisWeek} min="0" name="redeemedPoints" required type="number"/></label></div><label className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-900"><input className="mt-0.5" name="confirmReset" required type="checkbox"/><span>I understand these values overwrite this week&apos;s existing points and activity.</span></label><Button type="submit" variant="destructive">Overwrite this week</Button></form>
    </WorkspaceModal>

    <WorkspaceModal active={activeModal === "family"} onClose={() => setActiveModal(null)} title="Manage family">
      <section><h3 className="text-sm font-semibold text-slate-900">Manage {childName}</h3><form action={renameChild} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><input name="childId" type="hidden" value={childId}/><label className="grid gap-1 text-sm font-medium text-slate-700">Display name<Input defaultValue={childName} maxLength={80} name="displayName" required/></label><Button type="submit">Save name</Button></form><form action={archiveChild} className="mt-3"><input name="childId" type="hidden" value={childId}/><Button type="submit" variant="outline">Archive profile</Button></form></section>
      <section className="mt-5 border-t border-slate-200 pt-5"><h3 className="text-sm font-semibold text-slate-900">Add a child</h3><form action={createChild} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={setBrowserTimeZone}><input name="timeZone" type="hidden" value="UTC"/><label className="grid gap-1 text-sm font-medium text-slate-700">Display name<Input maxLength={80} name="displayName" required/></label><Button type="submit">Add child</Button></form></section>
      <section className="mt-5 border-t border-slate-200 pt-5"><h3 className="text-sm font-semibold text-slate-900">Household time zone</h3><form action={updateHouseholdTimeZone} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="grid gap-1 text-sm font-medium text-slate-700">IANA time zone<Input defaultValue={timeZone} name="timeZone" required/></label><Button type="submit">Save</Button></form></section>
    </WorkspaceModal>
  </>;
}
