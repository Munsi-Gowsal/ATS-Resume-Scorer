"use client";

import React from "react";
import { Sparkles, Search, Bell, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onNewScanClick: () => void;
}

export function DashboardHeader({
  searchTerm,
  onSearchChange,
  onNewScanClick,
}: DashboardHeaderProps) {
  return (
    <header className="glass-panel sticky top-4 z-40 rounded-2xl px-6 py-4 border border-white/10 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Title & Brand */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            Resume Intelligence Dashboard
            <Badge variant="purple" className="text-[10px] py-0.5">Live API</Badge>
          </h1>
          <p className="text-xs text-slate-400">Manage parsed resumes, ATS scores, and skill gap reports.</p>
        </div>
      </div>

      {/* Actions: Search, Notifications, New Scan CTA */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search Bar */}
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate or role..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950/50 text-xs text-white placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 backdrop-blur-md transition-all"
          />
        </div>

        {/* Notifications Icon */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        {/* New Scan Button */}
        <Button variant="primary" size="sm" onClick={onNewScanClick} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-1" />
          <span>Scan Resume</span>
        </Button>

        {/* User Profile Avatar */}
        <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 font-semibold text-xs ml-1 shadow">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
