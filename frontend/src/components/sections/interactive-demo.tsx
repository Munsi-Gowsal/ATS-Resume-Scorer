"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function InteractiveDemo() {
  const [selectedRole, setSelectedRole] = useState<"backend" | "fullstack" | "frontend">("backend");

  const rolesData = {
    backend: {
      title: "Senior Backend Engineer",
      company: "Acme Cloud Infrastructure",
      score: 88,
      matched: ["Python / FastAPI", "PostgreSQL", "System Architecture", "REST APIs"],
      missing: ["gRPC / Protobuf", "Kubernetes"],
      suggestion: "Quantify database optimization metrics and highlight microservices scaling experience.",
    },
    fullstack: {
      title: "Staff Fullstack Engineer",
      company: "Vercel Partner Ecosystem",
      score: 94,
      matched: ["TypeScript", "Next.js 15", "Tailwind CSS", "GraphQL", "Node.js"],
      missing: ["AWS Lambda Edge"],
      suggestion: "Add your recent Next.js 15 App Router migration achievements to push score to 98%.",
    },
    frontend: {
      title: "Principal UI Architect",
      company: "Linear Design Systems",
      score: 76,
      matched: ["React 19", "Design Systems", "Web Performance", "Accessibility"],
      missing: ["Three.js / WebGL", "State State Machines (XState)"],
      suggestion: "Emphasize component accessibility audit scores (WCAG AA) and bundle size reductions.",
    },
  };

  const active = rolesData[selectedRole];

  return (
    <section id="demo" className="py-20 relative px-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard glow="cyan" className="p-8 md:p-12 border border-white/15">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <Badge variant="cyan" className="mb-2">Interactive Match Playground</Badge>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">Test the AI Engine Live</h3>
              <p className="text-slate-300 text-sm mt-1">Select a target job description role to simulate instant match score extraction.</p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 glass-panel rounded-xl border border-white/10 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSelectedRole("backend")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedRole === "backend" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Backend Engineer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("fullstack")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedRole === "fullstack" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Fullstack Engineer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("frontend")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedRole === "frontend" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                UI Architect
              </button>
            </div>
          </div>

          {/* Interactive Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-center">
            {/* Left: Input File Preview */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-purple-400" /> Candidate_Resume.pdf</span>
                <span className="text-emerald-400">Parsed Clean</span>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl text-xs font-mono text-slate-300 leading-relaxed border border-white/5 space-y-2">
                <p><strong>Target Role:</strong> {active.title}</p>
                <p><strong>Target Employer:</strong> {active.company}</p>
                <p className="text-slate-400 pt-2 border-t border-white/10">"Experienced software engineer specializing in scalable distributed web platforms..."</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <span>Upload Custom Resume</span>
              </Button>
            </div>

            {/* Middle: Live Score Metric */}
            <motion.div
              key={selectedRole}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 rounded-2xl border border-purple-500/30 text-center flex flex-col items-center justify-center bg-purple-950/20"
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-purple-300 mb-2">Calculated Relevance</span>
              <div className="text-6xl font-black tracking-tight text-white mb-2">{active.score}%</div>
              <Badge variant={active.score > 90 ? "emerald" : "amber"}>
                {active.score > 90 ? "Strong Fit" : "Moderate Gap Identified"}
              </Badge>
              <p className="text-xs text-slate-400 mt-4 leading-normal px-2">
                {active.suggestion}
              </p>
            </motion.div>

            {/* Right: Skill Matrix Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Skill Match Breakdown</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-emerald-400 font-medium mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({active.matched.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {active.matched.map((m, i) => (
                        <Badge key={i} variant="emerald" className="text-[11px] py-0.5">{m}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-amber-400 font-medium mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing Skills ({active.missing.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {active.missing.map((m, i) => (
                        <Badge key={i} variant="amber" className="text-[11px] py-0.5">{m}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full mt-2">
                <span>View Full Analysis</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
