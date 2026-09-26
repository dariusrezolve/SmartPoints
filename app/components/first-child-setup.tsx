"use client";

import { type FormEvent } from "react";
import { createChild } from "@/app/children/actions";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

function setBrowserTimeZone(event: FormEvent<HTMLFormElement>) {
  const timeZoneField = event.currentTarget.elements.namedItem("timeZone");
  if (timeZoneField instanceof HTMLInputElement) {
    timeZoneField.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }
}

export function FirstChildSetup() {
  return (
    <main className="workspace-page mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10">
      <Card className="w-full p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Welcome to SmartPoints</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Create your family</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Start with a child profile. You can add more children and choose their tasks and rewards later.</p>
        <form action={createChild} className="mt-6 grid gap-4" onSubmit={setBrowserTimeZone}>
          <input name="timeZone" type="hidden" value="UTC" />
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Child&apos;s display name
            <Input autoFocus maxLength={80} name="displayName" required />
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-950">
            <input className="mt-0.5" name="useStarterTemplate" type="checkbox" />
            <span><strong className="block">Start with the daily task list</strong>Copy the included tasks and rewards for this child. You can edit them later.</span>
          </label>
          <Button type="submit">Create child profile</Button>
        </form>
      </Card>
    </main>
  );
}
