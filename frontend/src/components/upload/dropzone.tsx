"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

interface DropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export function Dropzone({ selectedFile, onFileSelect, error }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.doc"
        className="hidden"
        id="resume-file-input"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label="Upload resume file dropzone. Drag and drop PDF or DOCX file here or press space to browse."
          className={`glass-panel p-8 md:p-12 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? "border-purple-400 bg-purple-950/30 scale-[1.01]"
              : error
              ? "border-red-500/50 bg-red-950/10"
              : "border-white/20 hover:border-purple-400/60 hover:bg-white/5"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 mx-auto flex items-center justify-center mb-4 text-purple-300 shadow-lg shadow-purple-500/10">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            Drag & Drop candidate resume here
          </h3>
          <p className="text-slate-400 text-xs mb-4">
            Supports <strong className="text-slate-200">PDF</strong> or <strong className="text-slate-200">DOCX</strong> documents up to 5MB
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/10 hover:bg-white/15 transition-colors">
            Browse Files from Computer
          </div>

          {error && (
            <p className="mt-4 text-xs font-semibold text-red-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>
      ) : (
        <GlassCard glow="purple" className="p-6 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm truncate max-w-xs">{selectedFile.name}</span>
                <Badge variant="emerald" className="gap-1 py-0.5 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Size: {formatFileSize(selectedFile.size)} • Type: {selectedFile.type.includes("pdf") ? "PDF Document" : "Word DOCX"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFileSelect(null)}
            aria-label="Remove uploaded file"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <X className="w-5 h-5" />
          </button>
        </GlassCard>
      )}
    </div>
  );
}
