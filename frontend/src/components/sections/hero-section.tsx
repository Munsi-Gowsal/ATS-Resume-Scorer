"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, CheckCircle, Zap, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";

export function HeroSection() {
  return (
    <section className="relative pt-36 pb-20 md:pt-44 md:pb-32 overflow-hidden px-4">
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-6"
        >
          <Badge variant="purple" className="px-4 py-1.5 text-sm gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Next-Gen AI Resume Matching Engine 2.0</span>
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
        >
          Land your dream role with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-500">
            precision AI matching
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Analyze your resume against any Job Description in seconds. Uncover missing skill gaps, beat ATS screeners, and optimize bullet points automatically.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-xl shadow-purple-500/25">
            <span>Scan Resume Free</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            <FileSearch className="w-5 h-5 mr-2 text-cyan-400" />
            <span>View Interactive Demo</span>
          </Button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400 font-medium"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-cyan-400" /> 100% Private & Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-400" /> Instant ATS Score
          </span>
        </motion.div>

        {/* Hero Interactive Glass Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <GlassCard glow="purple" className="p-6 md:p-8 text-left border border-white/15 shadow-2xl max-w-4xl mx-auto">
            {/* Header of Mock Screen */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">Analysis Output — Senior Backend Engineer</span>
              </div>
              <Badge variant="emerald">Live Match Result</Badge>
            </div>

            {/* Content of Mock Screen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Radial Match Score Box */}
              <div className="glass-panel rounded-xl p-5 text-center flex flex-col items-center justify-center border border-white/10">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-400 stroke-current"
                      strokeDasharray="88, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold text-white">88%</span>
                </div>
                <span className="mt-3 text-xs font-semibold text-purple-300 uppercase tracking-wider">Overall ATS Score</span>
              </div>

              {/* Skill Matrix Summary */}
              <div className="glass-panel rounded-xl p-5 md:col-span-2 border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                    <span>Critical Skill Match Breakdown</span>
                    <span className="text-xs text-slate-400">12 Skills Identified</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="emerald">Python / FastAPI (100%)</Badge>
                    <Badge variant="emerald">PostgreSQL (95%)</Badge>
                    <Badge variant="emerald">Microservices (90%)</Badge>
                    <Badge variant="amber">Docker & CI/CD (65%)</Badge>
                    <Badge variant="purple">gRPC / Protobuf (Missing)</Badge>
                    <Badge variant="purple">Kubernetes (Missing)</Badge>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between">
                  <span>💡 <strong>Recommendation:</strong> Add 2 missing cloud skills to increase score to 96%</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
