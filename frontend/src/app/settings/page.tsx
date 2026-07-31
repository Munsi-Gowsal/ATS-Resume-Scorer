"use client";

import React, { useState } from "react";
import { Sparkles, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { SettingsNav, SettingsTab } from "@/components/settings/settings-nav";
import { ProfileSection } from "@/components/settings/profile-section";
import { ApiKeysSection } from "@/components/settings/api-keys-section";
import { AtsPreferencesSection } from "@/components/settings/ats-preferences-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewState, setViewState] = useState<"data" | "empty" | "error">("data");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 md:p-8 max-w-4xl mx-auto selection:bg-purple-500 selection:text-white">
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
        <Badge variant="purple" className="gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Platform Settings
        </Badge>
      </header>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Account & Parser Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage workspace profile credentials, custom LLM API keys, and ATS matching algorithms.
        </p>
      </div>

      {/* Toast Saved Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-xs text-white flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* State: Empty View */}
      {viewState === "empty" && (
        <GlassCard className="p-12 text-center border border-white/10 max-w-xl mx-auto my-12">
          <h3 className="text-xl font-bold text-white mb-2">No Settings Loaded</h3>
          <p className="text-xs text-slate-400 mb-6">Your preferences could not be found. Initialize default settings below.</p>
          <Button variant="primary" size="sm" onClick={() => setViewState("data")}>Initialize Default Settings</Button>
        </GlassCard>
      )}

      {/* State: Error View */}
      {viewState === "error" && (
        <GlassCard className="p-8 text-center border border-red-500/30 bg-red-950/20 max-w-xl mx-auto my-12">
          <h3 className="text-xl font-bold text-white mb-2">Settings Sync Error</h3>
          <p className="text-xs text-slate-400 mb-6">Unable to synchronize account settings with cloud vault.</p>
          <Button variant="secondary" size="sm" onClick={() => setViewState("data")}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retry Sync
          </Button>
        </GlassCard>
      )}

      {/* State: Data View */}
      {viewState === "data" && (
        <main id="settings-content">
          {/* Category Navigation Tabs */}
          <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content Sections */}
          <div className="animate-in fade-in duration-200">
            {activeTab === "profile" && (
              <ProfileSection onSave={(data) => showToast("Profile information updated successfully!")} />
            )}
            {activeTab === "apikeys" && <ApiKeysSection />}
            {activeTab === "ats" && <AtsPreferencesSection />}
            {activeTab === "notifications" && <NotificationsSection />}
          </div>
        </main>
      )}
    </div>
  );
}
