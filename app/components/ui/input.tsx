import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-xl border border-slate-200/90 bg-white/90 px-3.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100", className)} {...props} />;
}
