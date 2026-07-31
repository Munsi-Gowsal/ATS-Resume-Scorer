"use client";

import React from "react";
import { ExternalLink, MoreHorizontal, FileCheck, FileWarning, FileX } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { RecentScanItem } from "@/types/dashboard";

interface RecentAnalysesProps {
  items: RecentScanItem[];
  onSelectScan: (item: RecentScanItem) => void;
}

export function RecentAnalyses({ items, onSelectScan }: RecentAnalysesProps) {
  const getStatusBadge = (status: RecentScanItem["atsStatus"]) => {
    switch (status) {
      case "Passed":
        return (
          <Badge variant="emerald" className="gap-1">
            <FileCheck className="w-3 h-3" /> ATS Passed
          </Badge>
        );
      case "Warning":
        return (
          <Badge variant="amber" className="gap-1">
            <FileWarning className="w-3 h-3" /> Minor Gaps
          </Badge>
        );
      case "Failed":
        return (
          <Badge variant="purple" className="gap-1">
            <FileX className="w-3 h-3" /> Action Req.
          </Badge>
        );
    }
  };

  return (
    <GlassCard className="p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Recent Resume Scans</h3>
          <p className="text-xs text-slate-400">Click any row to open detailed skill gap breakdown.</p>
        </div>
        <Badge variant="outline">{items.length} Scans Completed</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <caption className="sr-only">List of recent candidate resume analyses and match scores</caption>
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <th scope="col" className="pb-3 px-3">Candidate / Resume</th>
              <th scope="col" className="pb-3 px-3">Target Role & Company</th>
              <th scope="col" className="pb-3 px-3">Match Score</th>
              <th scope="col" className="pb-3 px-3">ATS Status</th>
              <th scope="col" className="pb-3 px-3">Date</th>
              <th scope="col" className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((scan) => (
              <tr
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="hover:bg-white/5 cursor-pointer transition-colors duration-150 rounded-xl"
              >
                <td className="py-3.5 px-3 font-semibold text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                    {scan.candidateName.charAt(0)}
                  </div>
                  <span>{scan.candidateName}</span>
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-medium text-slate-200">{scan.targetRole}</div>
                  <div className="text-[11px] text-slate-500">{scan.company}</div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{scan.matchScore}%</span>
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          scan.matchScore > 85
                            ? "bg-emerald-400"
                            : scan.matchScore > 70
                            ? "bg-amber-400"
                            : "bg-purple-400"
                        }`}
                        style={{ width: `${scan.matchScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">{getStatusBadge(scan.atsStatus)}</td>
                <td className="py-3.5 px-3 text-slate-400">{scan.date}</td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    type="button"
                    aria-label={`Open details for ${scan.candidateName}`}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
