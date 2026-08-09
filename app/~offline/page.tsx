"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/card";
import { loadLatestOfflineSnapshot, type OfflineSnapshot } from "@/lib/offline/storage";

export default function OfflinePage() {
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | null | undefined>(undefined);
  useEffect(() => { void loadLatestOfflineSnapshot().then(setSnapshot).catch(() => setSnapshot(null)); }, []);
  return <main className="workspace-page mx-auto w-full max-w-xl px-5 pb-10 pt-6"><Card className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Offline mode</p>{snapshot === undefined ? <p className="mt-3 text-sm text-slate-600">Loading your saved day…</p> : snapshot ? <><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{snapshot.childName}&apos;s points</h1><p className="mt-2 text-sm text-slate-500">Saved {snapshot.currentDate} · {snapshot.balance} remaining</p><div className="mt-5 grid grid-cols-2 gap-3">{snapshot.tasks.map((task) => <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center" key={task.id}><strong className="block text-slate-900">{task.name}</strong><span className="font-bold text-emerald-700">+{task.points}</span></div>)}</div><p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Reconnect to sync your saved actions.</p></> : <><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">You&apos;re offline</h1><p className="mt-3 text-sm text-slate-600">Open SmartPoints online once to save the current day on this iPhone.</p></>}</Card></main>;
}
