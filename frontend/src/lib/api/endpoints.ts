import type { ParsedDocument, Resume, ParsedJobDescription, MatchResult, HealthCheck } from '@/types/api';

export const API_ENDPOINTS = {
  health: '/health',
  parseResume: '/parse-resume',
  analyzeResume: '/analyze-resume',
  parseJobDescription: '/parse-job-description',
  match: '/match',
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

export type ParseResumeResponse = ParsedDocument;
export type AnalyzeResumeResponse = Resume;
export type ParseJobDescriptionResponse = ParsedJobDescription;
export type MatchResponse = MatchResult;
export type HealthCheckResponse = HealthCheck;

export interface ParseJobDescriptionRequest {
  raw_text: string;
}

export interface MatchRequest {
  file: File;
  jd_text?: string;
  jd_file?: File;
}