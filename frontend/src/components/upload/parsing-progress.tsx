"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

interface ParsingProgressProps {
  onComplete: () => void;
}

export function ParsingProgress({ onComplete }: ParsingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Extracting Text & Document Structure", desc: "Parsing PDF font tokens, section headers, and work history..." },
    { title: "Extracting Hard Skills & Frameworks", desc: "Running spaCy & RegEx NER pipeline for technical stack..." },
    { title: "Semantic Skill Gap Matching", desc: "Comparing extracted skills against target job description requirements..." },
    { title: "Computing ATS Relevance Score", desc: "Generating keyword density matrix and bullet point rewrites..." },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [onComplete, steps.length]);

  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <GlassCard glow="purple" className="p-8 text-center border border-purple-500/30 max-w-xl mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 mx-auto flex items-center justify-center mb-6 text-purple-300 shadow-xl shadow-purple-500/20">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>

      <Badge variant="purple" className="mb-3">
        AI Pipeline Active ({progressPercent}%)
      </Badge>

      <h3 className="text-xl font-bold text-white mb-2">Analyzing Resume Intelligence</h3>
      <p className="text-xs text-slate-400 mb-8 max-w-sm mx-auto">
        Please wait while our NLP pipeline processes your document against target job criteria.
      </p>

      {/* Dynamic Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden mb-8 border border-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step Indicators */}
      <div className="space-y-3 text-left">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
              idx === currentStep
                ? "bg-purple-950/40 border-purple-500/40 text-white"
                : idx < currentStep
                ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                : "bg-white/5 border-white/5 opacity-40 text-slate-500"
            }`}
          >
            {idx < currentStep ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : idx === currentStep ? (
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0 mt-0.5" />
            ) : (
              <div className="w-5 h-5 rounded-full border border-slate-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-semibold">{step.title}</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
