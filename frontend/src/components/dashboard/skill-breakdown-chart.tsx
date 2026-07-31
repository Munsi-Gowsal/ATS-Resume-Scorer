"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { SkillFrequencyPoint } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";

interface SkillBreakdownChartProps {
  data: SkillFrequencyPoint[];
}

export function SkillBreakdownChart({ data }: SkillBreakdownChartProps) {
  return (
    <GlassCard glow="cyan" className="p-6 border border-white/10 flex flex-col justify-between h-[360px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Skill Frequency Distribution
            <Badge variant="cyan">Top Required</Badge>
          </h3>
          <p className="text-xs text-slate-400">Matched skills vs. missing skill gaps across job descriptions.</p>
        </div>
      </div>

      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis dataKey="skill" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "rgba(6, 182, 212, 0.3)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                color: "#F8FAFC",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Bar dataKey="count" name="Matched Count" fill="#22C55E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="missingCount" name="Missing Gap Count" fill="#F43F5E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
