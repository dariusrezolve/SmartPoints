"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold leading-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  { variants: { size: { icon: "h-9 w-9", md: "h-10 px-4", sm: "h-8 px-3" }, variant: { destructive: "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm shadow-rose-900/15 hover:-translate-y-0.5 hover:shadow-md", ghost: "text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-950", outline: "border border-emerald-200/90 bg-white/80 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50", primary: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-900/20 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-md" } }, defaultVariants: { size: "md", variant: "primary" } },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ size, variant }), className)} {...props} />;
}
