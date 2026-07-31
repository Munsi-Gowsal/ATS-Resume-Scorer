"use client";

import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Failed to load dashboard metrics. Please check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <GlassCard className="p-8 text-center border border-red-500/30 bg-red-950/20 max-w-xl mx-auto my-12">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center mb-4 text-red-400">
        <AlertOctagon className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Dashboard Sync Error</h3>
      <p className="text-slate-300 text-xs max-w-sm mx-auto mb-6 leading-relaxed">
        {message}
      </p>

      <Button variant="secondary" size="sm" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-2" />
        <span>Retry Connection</span>
      </Button>
    </GlassCard>
  );
}
