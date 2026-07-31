"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { SkillGapItem } from "@/types/results";

interface SkillGapMatrixProps {
  skills: SkillGapItem[];
}

export function SkillGapMatrix({ skills }: SkillGapMatrixProps) {
  const [filter, setFilter] = useState<"All" | "Matched" | "Missing" | "Partial">("All");
  const [search, setSearch] = useState("");

  const filteredSkills = skills.filter((skill) => {
    const matchesFilter = filter === "All" || skill.status === filter;
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase()) || skill.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: SkillGapItem["status"], percentage: number) => {
    switch (status) {
      case "Matched":
        return (
          <Badge variant="emerald" className="gap-1 py-0.5 text-[11px]">
            <CheckCircle2 className="w-3 h-3" /> Matched ({percentage}%)
          </Badge>
        );
      case "Partial":
        return (
          <Badge variant="amber" className="gap-1 py-0.5 text-[11px]">
            <AlertTriangle className="w-3 h-3" /> Partial ({percentage}%)
          </Badge>
        );
      case "Missing":
        return (
          <Badge variant="purple" className="gap-1 py-0.5 text-[11px]">
            <XCircle className="w-3 h-3" /> Missing (0%)
          </Badge>
        );
    }
  };

  return (
    <GlassCard className="p-6 border border-white/10 flex flex-col justify-between h-full">
      {/* Header & Filter Controls */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Skill Gap Matrix</h3>
            <p className="text-xs text-slate-400">Semantic comparison of resume credentials vs. required hard skills.</p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/50 text-xs text-white placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 glass-panel rounded-xl border border-white/10 w-fit">
          {(["All", "Matched", "Missing", "Partial"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4 hover:border-white/15 transition-all"
          >
            <div>
              <span className="font-semibold text-white text-xs block">{skill.name}</span>
              <span className="text-[10px] text-slate-400">{skill.category}</span>
            </div>
            {getStatusBadge(skill.status, skill.matchPercentage)}
          </div>
        ))}

        {filteredSkills.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">
            No skills found matching filter criteria.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
