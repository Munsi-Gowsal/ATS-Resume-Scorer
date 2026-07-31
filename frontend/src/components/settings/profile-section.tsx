"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Save, Upload } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { profileSchema, ProfileFormData } from "@/lib/settings-schema";

interface ProfileSectionProps {
  onSave: (data: ProfileFormData) => void;
}

export function ProfileSection({ onSave }: ProfileSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "Alex Rivera",
      email: "alex.rivera@example.com",
      jobTitle: "Senior Talent Acquisition Specialist",
      company: "Acme Cloud Corp",
    },
  });

  return (
    <GlassCard className="p-6 md:p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Profile Details</h3>
          <p className="text-xs text-slate-400">Manage your account credentials and personal preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        {/* Avatar Upload Box */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-xl font-bold border border-purple-400/30 shadow-lg">
            AR
          </div>
          <div>
            <span className="text-xs font-semibold text-white block mb-1">Profile Photo</span>
            <p className="text-[11px] text-slate-400 mb-2">JPG, GIF or PNG. Max size 2MB.</p>
            <Button variant="outline" size="sm" type="button" className="text-xs">
              <Upload className="w-3.5 h-3.5 mr-1" /> Change Avatar
            </Button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              {...register("fullName")}
              aria-invalid={!!errors.fullName}
              className="w-full bg-slate-950/50 text-sm text-white p-3 rounded-xl border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Work Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              aria-invalid={!!errors.email}
              className="w-full bg-slate-950/50 text-sm text-white p-3 rounded-xl border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Job Title
            </label>
            <input
              id="jobTitle"
              type="text"
              {...register("jobTitle")}
              aria-invalid={!!errors.jobTitle}
              className="w-full bg-slate-950/50 text-sm text-white p-3 rounded-xl border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {errors.jobTitle && <p className="text-xs text-red-400 mt-1">{errors.jobTitle.message}</p>}
          </div>

          <div>
            <label htmlFor="company" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Company / Organization
            </label>
            <input
              id="company"
              type="text"
              {...register("company")}
              aria-invalid={!!errors.company}
              className="w-full bg-slate-950/50 text-sm text-white p-3 rounded-xl border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company.message}</p>}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Profile Changes</span>
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
