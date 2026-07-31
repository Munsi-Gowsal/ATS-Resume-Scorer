"use client";

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ParseSuccessCardProps {
  filename: string;
  targetRole: string;
  onReset: () => void;
  onViewDashboard: () => void;
}

export function ParseSuccessCard({
  filename,
  targetRole,
  onReset,
  onViewDashboard,
}: ParseSuccessCardProps) {
  return (
    <GlassCard glow="purple" className="p-8 text-center border border-emerald-500/30 max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center mb-6 text-emerald-400 shadow-xl shadow-emerald-500/20">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <Badge variant="emerald" className="mb-3">
        Parsing & Analysis Complete
      </Badge>

      <h3 className="text-2xl font-bold text-white mb-2">Resume Intelligence Generated</h3>
      <p className="text-xs text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
        Extracted hard skills from <span className="text-purple-300 font-mono">{filename}</span> and computed ATS match score for{" "}
        <strong className="text-white">{targetRole}</strong>.
      </p>

      {/* Quick Score Metrics Preview Box */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/60 rounded-xl border border-white/10 mb-8 text-left">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Match Score</span>
          <span className="text-xl font-black text-emerald-400">88%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Skills Matched</span>
          <span className="text-xl font-black text-cyan-400">10 / 12</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">ATS Status</span>
          <span className="text-xs font-bold text-emerald-400 mt-1 block">Passed</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={onReset} className="w-full sm:w-auto">
          <span>Upload Another Resume</span>
        </Button>
        <Button variant="primary" size="sm" onClick={onViewDashboard} className="w-full sm:w-auto">
          <span>View Dashboard Report</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </GlassCard>
  );
}
