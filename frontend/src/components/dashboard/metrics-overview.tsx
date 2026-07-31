"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Target, Award, Zap, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ResumeScanMetric } from "@/types/dashboard";

interface MetricsOverviewProps {
  metrics: ResumeScanMetric[];
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case "FileText":
        return <FileText className="w-5 h-5 text-purple-400" />;
      case "Target":
        return <Target className="w-5 h-5 text-cyan-400" />;
      case "Award":
        return <Award className="w-5 h-5 text-emerald-400" />;
      case "Zap":
        return <Zap className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
        >
          <GlassCard interactive glow={idx === 1 ? "purple" : "none"} className="p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {metric.title}
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                {getIcon(metric.iconName)}
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white tracking-tight">{metric.value}</span>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${
                  metric.isPositive ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                {metric.change}
              </span>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
