"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Save } from "lucide-react";
import { updateStarTrailPreferences } from "@/app/children/actions";
import { StarTrailCard } from "@/app/components/star-trail-card";
import { starTrailThemes, type StarTrailThemeKey } from "@/lib/achievements/themes";

export function StarTrailSettings({ childId, initialTheme, initialVisible }: { childId: string; initialTheme: StarTrailThemeKey; initialVisible: boolean }) {
  const [themeKey, setThemeKey] = useState<StarTrailThemeKey>(initialTheme);
  const [visible, setVisible] = useState(initialVisible);
  return <form action={updateStarTrailPreferences} className="mt-6">
    <input name="childId" type="hidden" value={childId}/>
    <input name="themeKey" type="hidden" value={themeKey}/>
    <label className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm"><span className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">{visible ? <Eye size={20}/> : <EyeOff size={20}/>}</span><span><strong className="block text-slate-950">Show Star Trail</strong><small className="block text-slate-600">Choose whether this child sees the trail on the points dashboard.</small></span></span><input checked={visible} className="size-5 accent-emerald-600" name="showStarTrail" onChange={(event) => setVisible(event.target.checked)} type="checkbox"/></label>
    <h2 className="mt-8 text-xl font-extrabold text-slate-950">Choose a trail</h2><p className="mt-1 text-sm text-slate-600">Each preview shows how ten stars look. All trails earn the same bonus points.</p>
    <div className="mt-4 grid gap-5">{starTrailThemes.map((theme) => <label className={`block cursor-pointer rounded-[2rem] border-4 p-1 transition focus-within:ring-4 focus-within:ring-emerald-300 ${themeKey === theme.key ? "border-emerald-500 shadow-xl shadow-emerald-100" : "border-transparent hover:border-emerald-200"}`} key={theme.key}><input checked={themeKey === theme.key} className="sr-only" name="themeChoice" onChange={() => setThemeKey(theme.key)} type="radio" value={theme.key}/><span className="mb-2 flex items-center justify-between px-2 pt-1 text-sm font-bold text-slate-900"><span>{theme.name}</span><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${themeKey === theme.key ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{themeKey === theme.key ? <><Check size={14}/>Selected</> : "Choose trail"}</span></span><StarTrailCard preview stars={10} themeKey={theme.key}/></label>)}</div>
    <button className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-bold text-white shadow-xl shadow-emerald-900/25 transition hover:from-emerald-700 hover:to-teal-700 focus-visible:outline-4 focus-visible:outline-emerald-300" type="submit"><Save size={18}/>Save Star Trail</button>
  </form>;
}
