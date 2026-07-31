"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { KeywordDensityItem } from "@/types/results";

interface KeywordDensityTableProps {
  keywords: KeywordDensityItem[];
}

export function KeywordDensityTable({ keywords }: KeywordDensityTableProps) {
  const getStatusBadge = (status: KeywordDensityItem["status"]) => {
    switch (status) {
      case "Optimal":
        return <Badge variant="emerald" className="py-0.5 text-[10px]">Optimal</Badge>;
      case "Low":
        return <Badge variant="amber" className="py-0.5 text-[10px]">Low Frequency</Badge>;
      case "Missing":
        return <Badge variant="purple" className="py-0.5 text-[10px]">Missing</Badge>;
    }
  };

  return (
    <GlassCard className="p-6 border border-white/10 flex flex-col justify-between h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">Keyword Density Analysis</h3>
        <p className="text-xs text-slate-400">Frequency of high-value recruiter keywords in resume vs. job specification.</p>
      </div>

      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <caption className="sr-only">Keyword frequency analysis comparison table</caption>
          <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <th scope="col" className="pb-2 px-2">Keyword Symbol</th>
              <th scope="col" className="pb-2 px-2 text-center">JD Req.</th>
              <th scope="col" className="pb-2 px-2 text-center">Resume</th>
              <th scope="col" className="pb-2 px-2 text-right">Density Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {keywords.map((kw, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-mono font-semibold text-white">{kw.keyword}</td>
                <td className="py-3 px-2 text-center text-slate-300">{kw.requiredCount}x</td>
                <td className="py-3 px-2 text-center text-white font-bold">{kw.resumeCount}x</td>
                <td className="py-3 px-2 text-right">{getStatusBadge(kw.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
