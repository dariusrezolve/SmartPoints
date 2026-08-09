"use client";

import { Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";

const DISMISSED_KEY = "smartpoints-install-tip-dismissed";

export function InstallAppTip() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const installed = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setDismissed(installed || window.localStorage.getItem(DISMISSED_KEY) === "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  }

  if (dismissed !== false) return null;

  return <section className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-sm text-emerald-950 shadow-sm">
    <div><strong className="block">Install SmartPoints</strong><span className="text-emerald-800">Add it to your iPhone Home Screen for an app-like experience.</span></div>
    <div className="flex shrink-0 items-center gap-1">
      <Button aria-label="How to install SmartPoints" onClick={() => setOpen(true)} size="sm" type="button">Install</Button>
      <Button aria-label="Dismiss install suggestion" onClick={dismiss} size="icon" type="button" variant="ghost"><X aria-hidden="true" size={18}/></Button>
    </div>
    <dialog aria-labelledby="install-title" className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-slate-950/40" onClose={() => setOpen(false)} open={open}>
      <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">iPhone</p><h2 className="mt-1 text-xl font-bold text-slate-950" id="install-title">Install SmartPoints</h2></div><Button aria-label="Close install instructions" onClick={() => setOpen(false)} size="icon" type="button" variant="ghost"><X aria-hidden="true" size={18}/></Button></div>
        <ol className="mt-5 grid gap-3 text-sm text-slate-700"><li className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">1</span><span>Open this page in <strong>Safari</strong>.</span></li><li className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">2</span><span>Tap <Share aria-label="Share" className="mx-1 inline" size={16}/> Share.</span></li><li className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">3</span><span>Choose <SquarePlus aria-hidden="true" className="mx-1 inline" size={16}/> <strong>Add to Home Screen</strong>.</span></li></ol>
        <Button className="mt-6 w-full" onClick={() => setOpen(false)} type="button">Got it</Button>
      </div>
    </dialog>
  </section>;
}
