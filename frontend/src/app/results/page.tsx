"use client";

import React, { useState } from "react";
import { Sparkles, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ScoreHeroCard } from "@/components/results/score-hero-card";
import { SkillGapMatrix } from "@/components/results/skill-gap-matrix";
import { KeywordDensityTable } from "@/components/results/keyword-density-table";
import { AIRewriteCard } from "@/components/results/ai-rewrite-card";
import { ExportBar } from "@/components/results/export-bar";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { MatchReport } from "@/types/results";

export default function ResultsPage() {
  const [viewState, setViewState] = useState<"data" | "empty" | "error">("data");

  // Mock report dataset
  const report: MatchReport = {
    id: "report-8812",
    candidateName: "Alex Rivera",
    targetRole: "Senior Backend Engineer",
    companyName: "Acme Cloud Infrastructure",
    overallScore: 84,
    verdict: "Strong match for Senior Backend Engineer. High qualification overlap with missing cloud orchestrations.",
    highPriorityAdvice: "Add 'Kubernetes' and 'gRPC / Protobuf' to your primary Skills section to increase ATS screening score from 84% to 94%.",
    skills: [
      { id: "s1", name: "Python / FastAPI", category: "Languages", status: "Matched", matchPercentage: 100 },
      { id: "s2", name: "PostgreSQL", category: "Databases", status: "Matched", matchPercentage: 95 },
      { id: "s3", name: "System Architecture", category: "Architecture", status: "Matched", matchPercentage: 90 },
      { id: "s4", name: "Docker & CI/CD", category: "Cloud/DevOps", status: "Partial", matchPercentage: 65 },
      { id: "s5", name: "Kubernetes", category: "Cloud/DevOps", status: "Missing", matchPercentage: 0 },
      { id: "s6", name: "gRPC / Protobuf", category: "Frameworks", status: "Missing", matchPercentage: 0 },
    ],
    keywords: [
      { keyword: "Microservices", requiredCount: 4, resumeCount: 3, status: "Optimal" },
      { keyword: "Docker", requiredCount: 3, resumeCount: 1, status: "Low" },
      { keyword: "Kubernetes", requiredCount: 3, resumeCount: 0, status: "Missing" },
      { keyword: "FastAPI", requiredCount: 2, resumeCount: 4, status: "Optimal" },
      { keyword: "gRPC", requiredCount: 2, resumeCount: 0, status: "Missing" },
    ],
    rewrites: [
      {
        id: "r1",
        section: "Work Experience — Senior Engineer @ Acme",
        originalText: "Built backend APIs for processing user analytics data and connected database.",
        suggestedText: "Engineered scalable FastAPI microservices handling 2M+ daily events with 99.9% uptime, reducing p99 latency by 35%.",
        impactScore: "+15% ATS Match",
      },
      {
        id: "r2",
        section: "Work Experience — Backend Engineer @ CloudScale",
        originalText: "Maintained PostgreSQL database tables and wrote SQL queries for reporting.",
        suggestedText: "Optimized PostgreSQL query indexes and database pool sizes, improving reporting query execution time from 4.2s to 180ms.",
        impactScore: "+10% ATS Match",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 md:p-8 max-w-6xl mx-auto pb-28 selection:bg-purple-500 selection:text-white">
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

      {/* Top Header */}
      <header className="flex items-center justify-between py-4 mb-6 border-b border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-purple-300 font-medium">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Report ID: #{report.id}</span>
        </div>
      </header>

      {/* State: Empty View */}
      {viewState === "empty" && (
        <GlassCard className="p-12 text-center border border-white/10 max-w-xl mx-auto my-12">
          <h3 className="text-xl font-bold text-white mb-2">No Active Match Report Found</h3>
          <p className="text-xs text-slate-400 mb-6">Run a new resume scan to view detailed Skill Gap Matrix and ATS scoring.</p>
          <Link href="/upload">
            <Button variant="primary" size="sm">Start New Resume Scan</Button>
          </Link>
        </GlassCard>
      )}

      {/* State: Error View */}
      {viewState === "error" && (
        <GlassCard className="p-8 text-center border border-red-500/30 bg-red-950/20 max-w-xl mx-auto my-12">
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Match Report</h3>
          <p className="text-xs text-slate-400 mb-6">An error occurred while fetching the analysis report data.</p>
          <Button variant="secondary" size="sm" onClick={() => setViewState("data")}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
          </Button>
        </GlassCard>
      )}

      {/* State: Data View */}
      {viewState === "data" && (
        <main id="match-results-content" className="animate-in fade-in duration-300">
          {/* Hero Match Gauge Card */}
          <ScoreHeroCard
            score={report.overallScore}
            candidateName={report.candidateName}
            targetRole={report.targetRole}
            companyName={report.companyName}
            verdict={report.verdict}
            highPriorityAdvice={report.highPriorityAdvice}
          />

          {/* Analytics Grid: Skill Gap Matrix + Keyword Density Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
            <SkillGapMatrix skills={report.skills} />
            <KeywordDensityTable keywords={report.keywords} />
          </div>

          {/* AI Bullet Rewriter Section */}
          <AIRewriteCard rewrites={report.rewrites} />

          {/* Floating Bottom Export Bar */}
          <ExportBar />
        </main>
      )}
    </div>
  );
}
