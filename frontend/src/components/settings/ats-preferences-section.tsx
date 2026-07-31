"use client";

import React, { useState } from "react";
import { Sliders, Save, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export function AtsPreferencesSection() {
  const [strictness, setStrictness] = useState(3);
  const [threshold, setThreshold] = useState(75);
  const [fuzzyMatch, setFuzzyMatch] = useState(true);
  const [industry, setIndustry] = useState("Software Engineering");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <GlassCard className="p-6 md:p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">ATS Parsing & Matching Thresholds</h3>
          <p className="text-xs text-slate-400">Customize semantic matching sensitivity and industry keyword taxonomies.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Industry Taxonomy Selector */}
        <div>
          <label htmlFor="industry-select" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Default Industry Taxonomy
          </label>
          <select
            id="industry-select"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-slate-950/50 text-sm text-white p-3 rounded-xl border border-white/10 focus:border-purple-500 focus:outline-none"
          >
            <option value="Software Engineering">Software Engineering & DevOps</option>
            <option value="Product Management">Product & Design Architecture</option>
            <option value="Data Science">Data Science & AI Infrastructure</option>
            <option value="Cybersecurity">Cybersecurity & SecOps</option>
          </select>
        </div>

        {/* Minimum Score Threshold Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="score-threshold-slider" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Minimum ATS Passing Threshold ({threshold}%)
            </label>
            <span className="text-xs font-mono text-purple-300">{threshold}% Score Cutoff</span>
          </div>
          <input
            id="score-threshold-slider"
            type="range"
            min={40}
            max={95}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>40% (Permissive)</span>
            <span>75% (Standard)</span>
            <span>95% (Strict)</span>
          </div>
        </div>

        {/* Fuzzy Skill Match Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <span className="text-xs font-semibold text-white block">Enable Fuzzy Synonym Skill Matching</span>
            <p className="text-[11px] text-slate-400">
              Automatically match equivalent skill terms (e.g., treating "React.js" and "React" as 100% matched).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFuzzyMatch(!fuzzyMatch)}
            className={`w-11 h-6 rounded-full transition-colors p-1 border ${
              fuzzyMatch ? "bg-purple-600 border-purple-400/40" : "bg-slate-900 border-white/10"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${fuzzyMatch ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="primary" size="md" type="submit">
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-400" />
                <span>Preferences Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save ATS Preferences</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
