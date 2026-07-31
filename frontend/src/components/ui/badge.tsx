"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "purple" | "cyan" | "emerald" | "amber" | "outline";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "purple", children, className, ...props }: BadgeProps) {
  const variantStyles = {
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    outline: "bg-white/5 text-slate-300 border-white/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border backdrop-blur-md",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
