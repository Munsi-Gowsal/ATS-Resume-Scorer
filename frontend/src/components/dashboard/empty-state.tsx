"use client";

import React from "react";
import { FileUp, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onStartScan: () => void;
}

export function EmptyState({ onStartScan }: EmptyStateProps) {
  return (
    <GlassCard glow="purple" className="p-12 text-center border border-white/10 max-w-2xl mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mx-auto flex items-center justify-center mb-6 text-purple-300">
        <FileUp className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">No Resume Scans Found</h3>
      <p className="text-slate-300 text-sm max-w-md mx-auto mb-8 leading-relaxed">
        Upload a candidate resume PDF or DOCX along with a target job description to compute match scores, ATS compliance, and skill gaps.
      </p>

      <Button variant="primary" size="lg" onClick={onStartScan}>
        <Plus className="w-5 h-5 mr-2" />
        <span>Create First Resume Scan</span>
      </Button>
    </GlassCard>
  );
}
