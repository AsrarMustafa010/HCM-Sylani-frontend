import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800",
    secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    success: "bg-emerald-50/90 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800",
    warning: "bg-amber-50/90 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200/70 dark:border-amber-800",
    destructive: "bg-rose-50/90 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200/70 dark:border-rose-800",
    outline: "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
