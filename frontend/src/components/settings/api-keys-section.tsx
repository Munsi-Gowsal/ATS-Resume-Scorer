"use client";

import React, { useState } from "react";
import { Key, Eye, EyeOff, Copy, Check, Plus, Trash2, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ApiKeysSection() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: "k1", label: "Production OpenAI GPT-4o Key", key: "sk-proj-9827349827349827349827", status: "Active", created: "Jul 10, 2026" },
  ]);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCreateNew = () => {
    const newKey = {
      id: `k-${Date.now()}`,
      label: "Custom API Integration Key",
      key: `sk-proj-${Math.random().toString(36).substring(2, 18)}`,
      status: "Active",
      created: "Today",
    };
    setApiKeys((prev) => [...prev, newKey]);
  };

  return (
    <GlassCard className="p-6 md:p-8 border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">API Keys & LLM Integrations</h3>
            <p className="text-xs text-slate-400 mt-2">
              Never share your API keys in client-side code or public repositories. Keys begin with &quot;sk_live_&quot; or &quot;sk_test_&quot;.
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-1" /> Generate New Key
        </Button>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-3 mb-6">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold mb-0.5">Encrypted API Key Vault</strong>
          Your API keys are encrypted at rest using AES-256 and never logged or exposed in client bundles.
        </div>
      </div>

      {/* API Key List */}
      <div className="space-y-4">
        {apiKeys.map((item) => (
          <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-sm">{item.label}</span>
                <Badge variant="emerald" className="py-0 text-[10px]">{item.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span>{showKey ? item.key : "sk-proj-••••••••••••••••••••••••"}</span>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  aria-label={showKey ? "Hide API Key" : "Reveal API Key"}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button variant="secondary" size="sm" onClick={() => handleCopy(item.key)} className="text-xs">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
              <button
                type="button"
                onClick={() => handleRemoveKey(item.id)}
                aria-label="Delete API key"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {apiKeys.length === 0 && (
          <div className="p-8 text-center border border-dashed border-white/15 rounded-xl text-slate-400 text-xs">
            No active API keys found. Click &quot;Generate New Key&quot; to connect your LLM backend.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
