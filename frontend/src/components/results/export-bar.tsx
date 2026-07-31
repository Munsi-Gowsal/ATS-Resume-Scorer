"use client";

import React, { useState } from "react";
import { Download, Share2, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ExportBar() {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 max-w-2xl mx-auto px-4">
      <div className="glass-panel rounded-2xl p-4 border border-white/15 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-2xl">
        <Link
          href="/upload"
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleShare}>
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-1" />
                <span>Share Report</span>
              </>
            )}
          </Button>

          <Button variant="primary" size="sm" onClick={() => window.print()}>
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Export Report (PDF)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
