"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", children, className, disabled, ...props },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded-lg font-medium",
      md: "px-5 py-2.5 text-sm rounded-xl font-medium",
      lg: "px-7 py-3.5 text-base rounded-xl font-semibold",
    };

    const variantClasses = {
      primary: "glass-button-primary text-white border border-purple-400/30",
      secondary:
        "bg-white/10 text-white hover:bg-white/15 border border-white/10 backdrop-blur-md transition-all duration-200",
      outline:
        "border border-white/20 text-slate-200 hover:bg-white/5 hover:border-white/40 transition-all duration-200",
      ghost: "text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
