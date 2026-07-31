"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  glow?: "purple" | "cyan" | "none";
  className?: string;
}

export function GlassCard({
  children,
  interactive = false,
  glow = "none",
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl relative overflow-hidden transition-all duration-300",
        interactive ? "glass-panel-interactive" : "glass-panel",
        glow === "purple" && "before:absolute before:inset-0 before:ambient-glow-purple before:pointer-events-none",
        glow === "cyan" && "before:absolute before:inset-0 before:ambient-glow-cyan before:pointer-events-none",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
