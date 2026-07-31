"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface UploadErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export function UploadErrorAlert({ message, onDismiss }: UploadErrorAlertProps) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-red-500/40 bg-red-950/30 text-xs text-red-200 flex items-center justify-between gap-3 mb-6 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error notification"
        className="p-1 rounded-lg hover:bg-white/10 text-red-300 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
