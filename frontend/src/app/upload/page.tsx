"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/upload/dropzone";
import { JobSpecInput } from "@/components/upload/job-spec-input";
import { ParsingProgress } from "@/components/upload/parsing-progress";
import { ParseSuccessCard } from "@/components/upload/parse-success-card";
import { UploadErrorAlert } from "@/components/upload/upload-error-alert";
import { uploadFormSchema, UploadFormData } from "@/lib/upload-schema";

export default function UploadPage() {
  const [stage, setStage] = useState<"form" | "parsing" | "success">("form");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      targetRole: "",
      jobDescription: "",
    },
  });

  const onSubmit = () => {
    setGlobalError(null);
    setStage("parsing");
  };

  const handleResetForm = () => {
    reset();
    setStage("form");
    setGlobalError(null);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 md:p-8 max-w-4xl mx-auto selection:bg-purple-500 selection:text-white">
      {/* Top Header & Navigation */}
      <header className="flex items-center justify-between py-4 mb-8 border-b border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <Badge variant="purple" className="gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Resume Scanner 2.0
        </Badge>
      </header>

      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Scan Resume against Job Posting
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Upload a candidate resume and target job requirements to generate a real-time Skill Gap Matrix.
        </p>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <UploadErrorAlert message={globalError} onDismiss={() => setGlobalError(null)} />
      )}

      {/* Main Upload Form */}
      {stage === "form" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: File Dropzone */}
          <GlassCard className="p-6 md:p-8 border border-white/10">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Step 1: Upload Candidate Resume</span>
              <span className="text-xs text-purple-400 font-normal">PDF or DOCX (max 5MB)</span>
            </h2>
            <Controller
              name="resumeFile"
              control={control}
              render={({ field }) => (
                <Dropzone
                  selectedFile={field.value || null}
                  onFileSelect={(file) => setValue("resumeFile", file as File, { shouldValidate: true })}
                  error={errors.resumeFile?.message}
                />
              )}
            />
          </GlassCard>

          {/* Step 2: Job Spec Input */}
          <GlassCard className="p-6 md:p-8 border border-white/10">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Step 2: Define Target Role & Job Posting
            </h2>
            <JobSpecInput
              targetRole={watch("targetRole") || ""}
              onTargetRoleChange={(val) => setValue("targetRole", val, { shouldValidate: true })}
              jobDescription={watch("jobDescription") || ""}
              onJobDescriptionChange={(val) => setValue("jobDescription", val, { shouldValidate: true })}
              targetRoleError={errors.targetRole?.message}
              jobDescriptionError={errors.jobDescription?.message}
            />
          </GlassCard>

          {/* Submit Action Button */}
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="lg" type="submit" className="w-full sm:w-auto shadow-xl shadow-purple-500/25">
              <Send className="w-4 h-4 mr-2" />
              <span>Run AI Skill Gap Analysis</span>
            </Button>
          </div>
        </form>
      )}

      {/* Stage: Parsing Active */}
      {stage === "parsing" && (
        <ParsingProgress onComplete={() => setStage("success")} />
      )}

      {/* Stage: Parsing Success */}
      {stage === "success" && (
        <ParseSuccessCard
          filename={watch("resumeFile")?.name || "Candidate_Resume.pdf"}
          targetRole={watch("targetRole") || "Senior Backend Engineer"}
          onReset={handleResetForm}
          onViewDashboard={() => (window.location.href = "/dashboard")}
        />
      )}
    </div>
  );
}
