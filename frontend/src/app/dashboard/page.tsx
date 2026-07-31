"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { MatchScoreChart } from "@/components/dashboard/match-score-chart";
import { SkillBreakdownChart } from "@/components/dashboard/skill-breakdown-chart";
import { RecentAnalyses } from "@/components/dashboard/recent-analyses";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import {
  ResumeScanMetric,
  MatchScorePoint,
  SkillFrequencyPoint,
  RecentScanItem,
} from "@/types/dashboard";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewState, setViewState] = useState<"data" | "empty" | "error">("data");

  // Mock initial dashboard dataset
  const metrics: ResumeScanMetric[] = [
    { id: "1", title: "Total Resumes Scanned", value: 148, change: "+12.4%", isPositive: true, iconName: "FileText" },
    { id: "2", title: "Average Match Score", value: "84.2%", change: "+4.1%", isPositive: true, iconName: "Target" },
    { id: "3", title: "ATS Screener Pass Rate", value: "91.8%", change: "+2.8%", isPositive: true, iconName: "Award" },
    { id: "4", title: "Missing Skill Gaps Found", value: 34, change: "-8.5%", isPositive: true, iconName: "Zap" },
  ];

  const matchTrendData: MatchScorePoint[] = [
    { date: "Jul 01", score: 72, benchmark: 70 },
    { date: "Jul 05", score: 76, benchmark: 72 },
    { date: "Jul 10", score: 81, benchmark: 74 },
    { date: "Jul 15", score: 79, benchmark: 75 },
    { date: "Jul 20", score: 86, benchmark: 78 },
    { date: "Jul 23", score: 88, benchmark: 80 },
  ];

  const skillData: SkillFrequencyPoint[] = [
    { skill: "FastAPI", count: 42, missingCount: 4 },
    { skill: "PostgreSQL", count: 38, missingCount: 6 },
    { skill: "Docker", count: 29, missingCount: 12 },
    { skill: "Kubernetes", count: 18, missingCount: 22 },
    { skill: "gRPC", count: 14, missingCount: 19 },
  ];

  const recentScans: RecentScanItem[] = [
    {
      id: "scan-101",
      candidateName: "Alex Rivera",
      targetRole: "Senior Backend Engineer",
      company: "Acme Cloud Infrastructure",
      matchScore: 88,
      atsStatus: "Passed",
      date: "Today, 14:20",
      missingSkillsCount: 2,
    },
    {
      id: "scan-102",
      candidateName: "Elena Rostova",
      targetRole: "Staff Fullstack Engineer",
      company: "Vercel Partner Network",
      matchScore: 94,
      atsStatus: "Passed",
      date: "Yesterday",
      missingSkillsCount: 1,
    },
    {
      id: "scan-103",
      candidateName: "Marcus Vance",
      targetRole: "Principal UI Architect",
      company: "Linear Systems",
      matchScore: 76,
      atsStatus: "Warning",
      date: "Jul 21, 2026",
      missingSkillsCount: 3,
    },
    {
      id: "scan-104",
      candidateName: "Sarah Chen",
      targetRole: "Lead DevOps Specialist",
      company: "Stripe Connect",
      matchScore: 64,
      atsStatus: "Failed",
      date: "Jul 20, 2026",
      missingSkillsCount: 5,
    },
  ];

  // Search Filter
  const filteredScans = recentScans.filter(
    (item) =>
      item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 md:p-8 max-w-7xl mx-auto selection:bg-purple-500 selection:text-white">
      {/* State View Switcher (For Demo/Verification Purposes) */}
      <div className="mb-4 flex items-center justify-end gap-2 text-xs text-slate-400">
        <span className="font-semibold">Simulate UI State:</span>
        <button
          type="button"
          onClick={() => setViewState("data")}
          className={`px-2.5 py-1 rounded-md border ${
            viewState === "data" ? "bg-purple-600 text-white border-purple-500" : "bg-white/5 border-white/10"
          }`}
        >
          Data View
        </button>
        <button
          type="button"
          onClick={() => setViewState("empty")}
          className={`px-2.5 py-1 rounded-md border ${
            viewState === "empty" ? "bg-purple-600 text-white border-purple-500" : "bg-white/5 border-white/10"
          }`}
        >
          Empty View
        </button>
        <button
          type="button"
          onClick={() => setViewState("error")}
          className={`px-2.5 py-1 rounded-md border ${
            viewState === "error" ? "bg-purple-600 text-white border-purple-500" : "bg-white/5 border-white/10"
          }`}
        >
          Error View
        </button>
      </div>

      {/* Dashboard Header */}
      <DashboardHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewScanClick={() => setViewState("data")}
      />

      {/* Conditional State Rendering */}
      {viewState === "empty" && <EmptyState onStartScan={() => setViewState("data")} />}

      {viewState === "error" && <ErrorState onRetry={() => setViewState("data")} />}

      {viewState === "data" && (
        <main id="dashboard-content" className="space-y-8 animate-in fade-in duration-300">
          {/* KPI Metrics */}
          <MetricsOverview metrics={metrics} />

          {/* Recharts Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MatchScoreChart data={matchTrendData} />
            <SkillBreakdownChart data={skillData} />
          </div>

          {/* Recent Scan History */}
          <RecentAnalyses
            items={filteredScans}
            onSelectScan={(scan) => console.log("Selected scan:", scan.id)}
          />
        </main>
      )}
    </div>
  );
}
