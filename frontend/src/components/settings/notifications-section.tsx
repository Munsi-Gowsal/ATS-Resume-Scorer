"use client";

import React, { useState } from "react";
import { Bell, Save, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export function NotificationsSection() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [lowScoreAlerts, setLowScoreAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
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
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Notification Preferences</h3>
          <p className="text-xs text-slate-400">Control automated email alerts and summary digest notifications.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Toggle 1: Instant Scan Complete Alert */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <span className="text-xs font-semibold text-white block">Instant Scan Completion Notifications</span>
            <p className="text-[11px] text-slate-400">Receive an email immediately when a candidate resume parse completes.</p>
          </div>
          <button
            type="button"
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`w-11 h-6 rounded-full transition-colors p-1 border ${
              emailAlerts ? "bg-purple-600 border-purple-400/40" : "bg-slate-900 border-white/10"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailAlerts ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Toggle 2: Low Match Warning Alert */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <span className="text-xs font-semibold text-white block">Low Score Warning Alerts (&lt; 60%)</span>
            <p className="text-[11px] text-slate-400">Flag scans with significant missing skill gaps for immediate review.</p>
          </div>
          <button
            type="button"
            onClick={() => setLowScoreAlerts(!lowScoreAlerts)}
            className={`w-11 h-6 rounded-full transition-colors p-1 border ${
              lowScoreAlerts ? "bg-purple-600 border-purple-400/40" : "bg-slate-900 border-white/10"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${lowScoreAlerts ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Toggle 3: Weekly Digest Report */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <span className="text-xs font-semibold text-white block">Weekly Talent Intelligence Digest</span>
            <p className="text-[11px] text-slate-400">Receive a weekly PDF summary of top parsed candidates and skill trends.</p>
          </div>
          <button
            type="button"
            onClick={() => setWeeklyDigest(!weeklyDigest)}
            className={`w-11 h-6 rounded-full transition-colors p-1 border ${
              weeklyDigest ? "bg-purple-600 border-purple-400/40" : "bg-slate-900 border-white/10"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${weeklyDigest ? "translate-x-5" : "translate-x-0"}`} />
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
                <span>Save Notification Settings</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
