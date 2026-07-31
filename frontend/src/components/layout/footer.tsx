"use client";

import React from "react";
import { Sparkles, Globe, Share2, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/10 glass-panel mt-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand Info */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">ResumeIQ AI</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm text-center md:text-left">
            Next-generation semantic resume parser, skill gap matrix analyzer, and ATS screener.
          </p>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">ATS Guide</a>
          <a href="#" className="hover:text-white transition-colors">API Docs</a>
        </div>

        {/* Social / Connect Links */}
        <div className="flex items-center gap-4 text-slate-400">
          <a href="#" aria-label="Website" className="hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
            <Globe className="w-4 h-4" />
          </a>
          <a href="#" aria-label="Share Platform" className="hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
            <Share2 className="w-4 h-4" />
          </a>
          <a href="#" aria-label="Community Discussions" className="hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ResumeIQ AI Inc. All rights reserved. Built with Next.js 15, React 19, & Tailwind CSS.
      </div>
    </footer>
  );
}
