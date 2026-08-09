import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl border border-white/80 bg-white/85 shadow-[0_12px_40px_-22px_rgba(15,118,110,0.32)] backdrop-blur-xl", className)} {...props} />;
}
