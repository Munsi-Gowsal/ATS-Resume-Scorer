"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { MatchScorePoint } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";

interface MatchScoreChartProps {
  data: MatchScorePoint[];
}

export function MatchScoreChart({ data }: MatchScoreChartProps) {
  return (
    <GlassCard glow="purple" className="p-6 border border-white/10 flex flex-col justify-between h-[360px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Match Score Velocity
            <Badge variant="purple">30-Day Trend</Badge>
          </h3>
          <p className="text-xs text-slate-400">Average candidate relevance score improvement over time.</p>
        </div>
      </div>

      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[50, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "rgba(168, 85, 247, 0.3)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                color: "#F8FAFC",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#A855F7"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#scoreGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
