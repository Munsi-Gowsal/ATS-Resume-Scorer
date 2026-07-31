"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

interface ScoreHeroCardProps {
  score: number;
  candidateName: string;
  targetRole: string;
  companyName: string;
  verdict: string;
  highPriorityAdvice: string;
}

export function ScoreHeroCard({
  score,
  candidateName,
  targetRole,
  companyName,
  verdict,
  highPriorityAdvice,
}: ScoreHeroCardProps) {
  return (
    <GlassCard glow="purple" className="p-6 md:p-10 border border-white/15 mb-8 shadow-2xl">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Radial Match Score Meter */}
        <div className="relative w-44 h-44 flex flex-col items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              className="text-purple-400 stroke-current"
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${score}, 100` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div
            role="meter"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Overall resume match score: ${score}%`}
            className="absolute flex flex-col items-center justify-center text-center"
          >
            <span className="text-4xl font-extrabold text-white tracking-tight">{score}%</span>
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mt-0.5">
              Match Score
            </span>
          </div>
        </div>

        {/* Verdict & High-Priority Action */}
        <div className="flex-1 text-center lg:text-left space-y-4">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <Badge variant="purple" className="gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Resume Verdict
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Candidate: <strong className="text-slate-200">{candidateName}</strong> • Target: <strong className="text-slate-200">{targetRole}</strong> ({companyName})
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
            "{verdict}"
          </h2>

          {/* High Priority Advice Banner */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-semibold mb-0.5">High Impact Recommendation:</strong>
              {highPriorityAdvice}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
