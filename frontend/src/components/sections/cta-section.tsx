"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export function CTASection() {
  return (
    <section className="py-24 relative px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <GlassCard glow="purple" className="p-10 md:p-16 text-center border border-white/20 shadow-2xl relative">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to double your interview callbacks?
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Join thousands of engineers and tech professionals using AI Resume Intelligence to pass ATS screening and land top-tier offers.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-xl shadow-purple-500/30">
                <span>Start Free Analysis</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <span>Explore Enterprise Plans</span>
              </Button>
            </div>

            <div className="pt-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>No credit card required. Free 3 full resume scans included.</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
