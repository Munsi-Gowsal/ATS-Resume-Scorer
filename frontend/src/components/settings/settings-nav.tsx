"use client";

import React from "react";
import { User, Key, Sliders, Bell } from "lucide-react";

export type SettingsTab = "profile" | "apikeys" | "ats" | "notifications";

interface SettingsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  const tabs = [
    { id: "profile" as SettingsTab, label: "User Profile", icon: <User className="w-4 h-4" /> },
    { id: "apikeys" as SettingsTab, label: "API Keys & LLM", icon: <Key className="w-4 h-4" /> },
    { id: "ats" as SettingsTab, label: "ATS Preferences", icon: <Sliders className="w-4 h-4" /> },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div
      role="tablist"
      aria-label="Settings categories"
      className="glass-panel p-1.5 rounded-2xl border border-white/10 flex flex-wrap items-center gap-1 mb-8"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
            activeTab === tab.id
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
