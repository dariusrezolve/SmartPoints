"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  { variants: { size: { icon: "h-9 w-9", md: "h-10 px-4", sm: "h-8 px-3 text-xs" }, variant: { destructive: "bg-rose-600 text-white hover:bg-rose-700", ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950", outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50", primary: "bg-sky-600 text-white hover:bg-sky-700" } }, defaultVariants: { size: "md", variant: "primary" } },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ size, variant }), className)} {...props} />;
}
