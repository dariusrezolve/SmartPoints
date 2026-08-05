"use client";

import Link from "next/link";
import { useEffect, useRef, type FormEvent } from "react";
import { archiveChild, createChild, renameChild, updateHouseholdTimeZone } from "@/app/children/actions";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

type Child = { id: string; display_name: string };
type ChildProfileManagerProps = { childProfiles: Child[]; selectedChild: Child | null; timeZone: string };

function setBrowserTimeZone(event: FormEvent<HTMLFormElement>) {
  const timeZoneField = event.currentTarget.elements.namedItem("timeZone");
  if (timeZoneField instanceof HTMLInputElement) timeZoneField.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function ChildProfileManager({ childProfiles, selectedChild, timeZone }: ChildProfileManagerProps) {
  const familyMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && familyMenuRef.current && !familyMenuRef.current.contains(event.target)) {
        familyMenuRef.current.open = false;
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
  }, []);

  return (
    <header className="workspace-page mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 pt-6 sm:pt-8">
      <Link className="text-lg font-bold tracking-tight text-slate-950" href={selectedChild ? `/?child=${selectedChild.id}` : "/"}>SmartPoints</Link>
      <div className="flex items-center gap-2">
      <details className="group relative" ref={familyMenuRef}>
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700">{selectedChild?.display_name.slice(0, 1).toUpperCase() ?? "+"}</span>
          <span>{selectedChild?.display_name ?? "Your family"}</span><span className="text-slate-400">⌄</span>
        </summary>
        <Card className="absolute right-0 z-30 mt-3 w-[min(24rem,calc(100vw-2.5rem))] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Your family</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">Child profiles</h2>
          {childProfiles.length > 0 ? <nav aria-label="Child profiles" className="mt-4 flex flex-wrap gap-2">{childProfiles.map((child) => <Link aria-current={child.id === selectedChild?.id ? "page" : undefined} className={child.id === selectedChild?.id ? "rounded-full bg-sky-600 px-3 py-2 text-sm font-semibold text-white" : "rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"} href={`/?child=${child.id}`} key={child.id}>{child.display_name}</Link>)}</nav> : <p className="mt-4 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">Add the first child profile to start SmartPoints.</p>}

          {selectedChild ? <section className="mt-5 border-t border-slate-200 pt-5"><h3 className="text-sm font-semibold text-slate-900">Manage {selectedChild.display_name}</h3><form action={renameChild} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><input name="childId" type="hidden" value={selectedChild.id}/><label>Display name<Input defaultValue={selectedChild.display_name} maxLength={80} name="displayName" required/></label><Button type="submit">Save name</Button></form><form action={archiveChild} className="mt-3"><input name="childId" type="hidden" value={selectedChild.id}/><Button type="submit" variant="outline">Archive profile</Button></form></section> : null}

          <section className="mt-5 border-t border-slate-200 pt-5"><h3 className="text-sm font-semibold text-slate-900">Add a child</h3><form action={createChild} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={setBrowserTimeZone}><input name="timeZone" type="hidden" value="UTC"/><label>Display name<Input maxLength={80} name="displayName" required/></label><Button type="submit">Add child</Button></form></section>

          {selectedChild ? <section className="mt-5 border-t border-slate-200 pt-5"><h3 className="text-sm font-semibold text-slate-900">Household time zone</h3><form action={updateHouseholdTimeZone} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label>IANA time zone<Input defaultValue={timeZone} name="timeZone" required/></label><Button type="submit">Save</Button></form></section> : null}
        </Card>
      </details>
      <form action="/auth/sign-out" method="post"><Button size="sm" type="submit" variant="ghost">Sign out</Button></form>
      </div>
    </header>
  );
}
