"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { archiveChild, createChild, renameChild, updateHouseholdTimeZone } from "@/app/children/actions";
import { createReward, createTask, resetWeeklyPoints, setWeeklyTasks } from "@/app/points/actions";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { TaskIcon } from "@/lib/points/task-icons";
import { starterTasks, taskIconNames, type TaskIconName } from "@/lib/points/validation";

type Child = { id: string; display_name: string };
type Task = { id: string; name: string; points: number; icon: TaskIconName };
type ModalName = "task" | "reward" | "dailyTasks" | "family" | "resetWeek" | null;
type PointSummary = { balance: number; receivedThisWeek: number; redeemedThisWeek: number };

type Props = { childId: string; childName: string; childProfiles: Child[]; currentWeekStart: string; pointSummary: PointSummary; selectedTaskIds: Set<string>; taskCatalog: Task[]; timeZone: string };

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

  return <dialog aria-label={title} className="fixed inset-0 h-full w-full max-w-none border-0 bg-transparent p-5 backdrop:bg-slate-950/30" onClick={closeOnBackdrop} onClose={onClose} ref={dialogRef}>
    <Card className="mx-auto mt-[12vh] w-full max-w-lg p-5 shadow-xl sm:mt-[18vh] sm:p-6">
      <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold tracking-tight text-slate-950">{title}</h2><Button aria-label={`Close ${title}`} onClick={onClose} size="icon" type="button" variant="ghost">×</Button></div>
      {children}
    </Card>
  </dialog>;
}

export function WorkspaceMenu({ childId, childName, childProfiles, currentWeekStart, pointSummary, selectedTaskIds, taskCatalog, timeZone }: Props) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [activeModal, setActiveModal] = useState<ModalName>(null);
  const [selectedIcon, setSelectedIcon] = useState<TaskIconName>("CircleCheck");

  useEffect(() => {
    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && menuRef.current && !menuRef.current.contains(event.target)) menuRef.current.open = false;
    };
    document.addEventListener("pointerdown", closeOnOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
  }, []);

  function openModal(modal: Exclude<ModalName, null>) {
    if (menuRef.current) menuRef.current.open = false;
    setActiveModal(modal);
  }

  return <>
    <details className="group relative" ref={menuRef}>
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 [&::-webkit-details-marker]:hidden"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700">{childName.slice(0, 1).toUpperCase()}</span>Menu <span className="text-slate-400">⌄</span></summary>
      <Card className="absolute right-0 z-30 mt-3 w-[min(22rem,calc(100vw-2.5rem))] p-2 shadow-lg" role="menu">
        <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Your family</p>
        {childProfiles.map((child) => <Link aria-current={child.id === childId ? "page" : undefined} className={child.id === childId ? "mb-1 block rounded-lg bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800" : "mb-1 block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"} href={`/?child=${child.id}`} key={child.id} role="menuitem">{child.display_name}</Link>)}
        <Button className="w-full justify-start" onClick={() => openModal("family")} role="menuitem" size="sm" type="button" variant="ghost">Manage family</Button>
        <div className="my-2 border-t border-slate-200"/>
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Setup</p>
        <Button className="w-full justify-start" onClick={() => openModal("task")} role="menuitem" size="sm" type="button" variant="ghost">Add task</Button>
        <Button className="w-full justify-start" onClick={() => openModal("reward")} role="menuitem" size="sm" type="button" variant="ghost">Add reward</Button>
        <Button className="w-full justify-start" onClick={() => openModal("dailyTasks")} role="menuitem" size="sm" type="button" variant="ghost">Set Daily tasks</Button>
        <div className="my-2 border-t border-slate-200"/>
        <Button className="w-full justify-start text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={() => openModal("resetWeek")} role="menuitem" size="sm" type="button" variant="ghost">Reset this week</Button>
        <div className="my-2 border-t border-slate-200"/>
        <form action="/auth/sign-out" method="post"><Button className="w-full justify-start" role="menuitem" size="sm" type="submit" variant="ghost">Sign out</Button></form>
      </Card>
    </details>

    <WorkspaceModal active={activeModal === "task"} onClose={() => setActiveModal(null)} title="Create a task">
      <p className="mt-2 text-sm text-slate-500">Add a starter task or make one just for {childName}.</p>
      <div className="mt-5 flex flex-wrap gap-2">{starterTasks.map((task) => <form action={createTask} key={task.name}><input name="childId" type="hidden" value={childId}/><input name="name" type="hidden" value={task.name}/><input name="points" type="hidden" value={task.points}/><input name="icon" type="hidden" value={task.icon}/><input name="starterKey" type="hidden" value={task.name.toLowerCase().replaceAll(" ", "-")}/><Button size="sm" type="submit" variant="outline"><TaskIcon aria-hidden="true" name={task.icon} size={16}/>Add {task.name} (+{task.points})</Button></form>)}</div>
      <form action={createTask} className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-[1fr_7rem_auto] sm:items-end"><input name="childId" type="hidden" value={childId}/><input name="icon" type="hidden" value={selectedIcon}/><label className="grid gap-1 text-sm font-medium text-slate-700">Name<Input maxLength={80} name="name" required/></label><label className="grid gap-1 text-sm font-medium text-slate-700">Points<Input min="1" name="points" required type="number"/></label><Button type="submit">Create task</Button><fieldset className="sm:col-span-3"><legend className="text-sm font-medium text-slate-700">Icon</legend><div className="mt-2 flex flex-wrap gap-2">{taskIconNames.map((icon) => <Button aria-label={`Use ${icon} icon`} aria-pressed={selectedIcon === icon} className={selectedIcon === icon ? "border-sky-500 bg-sky-50 text-sky-700" : undefined} key={icon} onClick={() => setSelectedIcon(icon)} size="icon" type="button" variant="outline"><TaskIcon aria-hidden="true" name={icon} size={19}/></Button>)}</div></fieldset></form>
    </WorkspaceModal>

    <WorkspaceModal active={activeModal === "reward"} onClose={() => setActiveModal(null)} title="Create a reward">
      <p className="mt-2 text-sm text-slate-500">Rewards are reusable and can be redeemed before points are earned.</p>
      <form action={createReward} className="mt-6 grid gap-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end"><input name="childId" type="hidden" value={childId}/><label className="grid gap-1 text-sm font-medium text-slate-700">Name<Input maxLength={80} name="name" required/></label><label className="grid gap-1 text-sm font-medium text-slate-700">Cost<Input min="1" name="cost" required type="number"/></label><Button type="submit">Create reward</Button></form>
    </WorkspaceModal>

    <WorkspaceModal active={activeModal === "dailyTasks"} onClose={() => setActiveModal(null)} title="Set daily tasks">
      <p className="mt-2 text-sm text-slate-500">These tasks will be available every day this week, Monday through Sunday.</p>
      <Button className="mt-4" onClick={() => setActiveModal("task")} size="sm" type="button" variant="outline">Create a new task</Button>
      <form action={setWeeklyTasks} className="mt-5"><input name="childId" type="hidden" value={childId}/><input name="weekStart" type="hidden" value={currentWeekStart}/><fieldset className="grid gap-2">{taskCatalog.map((task) => <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm hover:bg-slate-50" key={task.id}><span className="flex items-center gap-3"><input defaultChecked={selectedTaskIds.has(task.id)} name="taskId" type="checkbox" value={task.id}/><span className="font-semibold text-slate-800">{task.name}</span></span><span className="text-slate-500">+{task.points}</span></label>)}</fieldset>{taskCatalog.length === 0 ? <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">Create a task first, then choose it for the week.</p> : <Button className="mt-5 w-full" type="submit">Save daily tasks</Button>}</form>
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
