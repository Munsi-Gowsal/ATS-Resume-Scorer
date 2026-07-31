"use client";

import React, { useState } from "react";
import { Copy, Check, Wand2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIRewriteItem } from "@/types/results";

interface AIRewriteCardProps {
  rewrites: AIRewriteItem[];
}

export function AIRewriteCard({ rewrites }: AIRewriteCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <GlassCard glow="purple" className="p-6 md:p-8 border border-purple-500/30 my-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <Badge variant="purple" className="mb-2 gap-1">
            <Wand2 className="w-3.5 h-3.5 text-purple-400" /> AI Bullet Rewriter
          </Badge>
          <h3 className="text-xl font-extrabold text-white">Quantified Achievement Suggestions</h3>
          <p className="text-xs text-slate-400">Replace passive duty bullet points with metrics-driven accomplishments tailored for target role.</p>
        </div>
      </div>

      <div className="space-y-6">
        {rewrites.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 font-mono">{item.section}</span>
              <Badge variant="emerald" className="text-[10px] py-0.5">
                {item.impactScore} Estimated Impact
              </Badge>
            </div>

            {/* Diff Viewer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Bullet */}
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                  Original Bullet
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">{item.originalText}</p>
              </div>

              {/* AI Suggested Bullet */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  AI Enhanced Rewrite
                </span>
                <p className="text-xs text-emerald-200 leading-relaxed font-mono font-medium">{item.suggestedText}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopy(item.id, item.suggestedText)}
                className="text-xs"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span>Copy Suggestion</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
