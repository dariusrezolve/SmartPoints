"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/card";
import { loadLatestOfflineSnapshot, type OfflineSnapshot } from "@/lib/offline/storage";

export default function OfflinePage() {
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | null | undefined>(undefined);
  useEffect(() => { void loadLatestOfflineSnapshot().then(setSnapshot).catch(() => setSnapshot(null)); }, []);
  return <main className="workspace-page mx-auto w-full max-w-xl px-5 pb-10 pt-6"><Card className="p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Offline</p>{snapshot === undefined ? <p className="mt-3 text-sm text-slate-600">Loading your saved day…</p> : snapshot ? <><h1 className="mt-2 text-3xl font-bold text-slate-950">{snapshot.childName}&apos;s points</h1><p className="mt-2 text-sm text-slate-500">Saved {snapshot.currentDate} · {snapshot.balance} remaining</p><div className="mt-5 grid grid-cols-2 gap-3">{snapshot.tasks.map((task) => <div className="rounded-xl bg-sky-50 p-4 text-center" key={task.id}><strong className="block text-slate-900">{task.name}</strong><span className="text-sky-700">+{task.points}</span></div>)}</div><p className="mt-5 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">Reconnect to record new points. Your daily actions will work offline in the next update.</p></> : <><h1 className="mt-2 text-3xl font-bold text-slate-950">You&apos;re offline</h1><p className="mt-3 text-sm text-slate-600">Open SmartPoints online once to save the current day on this iPhone.</p></>}</Card></main>;
}
