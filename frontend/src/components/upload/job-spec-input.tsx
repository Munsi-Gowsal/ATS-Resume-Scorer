"use client";

import React from "react";
import { FileCode, AlertCircle } from "lucide-react";

interface JobSpecInputProps {
  targetRole: string;
  onTargetRoleChange: (val: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (val: string) => void;
  targetRoleError?: string;
  jobDescriptionError?: string;
}

export function JobSpecInput({
  targetRole,
  onTargetRoleChange,
  jobDescription,
  onJobDescriptionChange,
  targetRoleError,
  jobDescriptionError,
}: JobSpecInputProps) {
  const handlePreFillSample = (role: string, text: string) => {
    onTargetRoleChange(role);
    onJobDescriptionChange(text);
  };

  const sampleRoles = [
    {
      role: "Senior Backend Engineer",
      text: "We are seeking a Senior Backend Engineer to architect microservices using Python, FastAPI, PostgreSQL, gRPC, and Docker. Experience with cloud infrastructure (Kubernetes, AWS) and distributed systems required.",
    },
    {
      role: "Staff Fullstack Engineer",
      text: "Looking for a Staff Engineer skilled in Next.js 15, React 19, TypeScript, Tailwind CSS, GraphQL, and serverless Node.js architecture. Must have proven experience delivering WCAG AA compliant user interfaces.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Target Job Title Input */}
      <div>
        <label htmlFor="target-role-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Target Job Title / Role
        </label>
        <input
          id="target-role-input"
          type="text"
          placeholder="e.g. Senior Backend Engineer"
          value={targetRole}
          onChange={(e) => onTargetRoleChange(e.target.value)}
          aria-invalid={!!targetRoleError}
          className={`w-full bg-slate-950/50 text-sm text-white placeholder-slate-500 px-4 py-3 rounded-xl border backdrop-blur-md transition-all focus:outline-none focus:ring-1 ${
            targetRoleError
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
              : "border-white/10 focus:border-purple-500 focus:ring-purple-500"
          }`}
        />
        {targetRoleError && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {targetRoleError}
          </p>
        )}
      </div>

      {/* Target Job Description Text Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="job-description-textarea" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Job Description Text / Requirements
          </label>
          <span className="text-xs text-slate-400">
            {jobDescription.length} / 50 min chars
          </span>
        </div>

        <textarea
          id="job-description-textarea"
          rows={6}
          placeholder="Paste the target job posting text, required qualifications, technical stack, and responsibilities here..."
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          aria-invalid={!!jobDescriptionError}
          className={`w-full bg-slate-950/50 text-xs sm:text-sm text-white placeholder-slate-500 p-4 rounded-xl border backdrop-blur-md transition-all focus:outline-none focus:ring-1 leading-relaxed ${
            jobDescriptionError
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
              : "border-white/10 focus:border-purple-500 focus:ring-purple-500"
          }`}
        />
        {jobDescriptionError && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {jobDescriptionError}
          </p>
        )}
      </div>

      {/* Pre-fill Sample Shortcuts */}
      <div className="pt-2">
        <span className="text-xs text-slate-400 block mb-2 font-medium">
          Quick Pre-fill Sample Specs:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleRoles.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePreFillSample(item.role, item.text)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>{item.role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
