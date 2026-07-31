"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Target, Wand2, ShieldCheck, BarChart3, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

export function FeaturesSection() {
  const features = [
    {
      icon: <Target className="w-6 h-6 text-purple-400" />,
      badge: "Semantic Matching",
      title: "Deep Skill Gap Matrix",
      description:
        "Instantly compare candidate resumes with job postings. Uncover missing hard skills, toolchain gaps, and qualification mismatches.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      badge: "ATS Optimization",
      title: "ATS Screener Simulator",
      description:
        "Test how top enterprise Applicant Tracking Systems parse your PDF layout, headers, bullet points, and keyword density.",
    },
    {
      icon: <Wand2 className="w-6 h-6 text-emerald-400" />,
      badge: "AI Rewriter",
      title: "Contextual Bullet Optimization",
      description:
        "Transform generic duty descriptions into high-impact, quantified achievement statements using industry-specific metrics.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
      badge: "Keyword Density",
      title: "Frequency & Importance Analysis",
      description:
        "Analyze keyword weight distribution in the target job spec and ensure your resume mirrors the recruiter's core criteria.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
      badge: "Privacy First",
      title: "Zero Data Retention Guarantee",
      description:
        "Your resume data is processed in ephemeral encrypted memory and never stored or sold to third-party recruiters.",
    },
    {
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      badge: "Real-time Speed",
      title: "Sub-Second Extraction",
      description:
        "High-performance FastAPI and Rust parsing pipelines extract text, experience, and credentials in less than 500ms.",
    },
  ];

  return (
    <section id="features" className="py-24 relative px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-4">
            Engineered For Job Seekers & Recruiters
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Everything you need to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-300">
              out-rank the competition
            </span>
          </h2>
          <p className="mt-4 text-slate-300 text-lg">
            Powered by advanced natural language processing and semantic embeddings for pinpoint accurate resume scoring.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <GlassCard interactive className="p-6 h-full flex flex-col justify-between border border-white/10">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <Badge variant="outline">{feat.badge}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{feat.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
