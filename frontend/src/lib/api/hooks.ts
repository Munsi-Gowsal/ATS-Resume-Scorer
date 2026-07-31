import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { apiService } from '@/lib/api/service';
import type { ParsedDocument, Resume, ParsedJobDescription, MatchResult, HealthCheck } from '@/types/api';
import type { ParseJobDescriptionRequest, MatchRequest } from '@/lib/api/endpoints';

export const queryKeys = {
  health: ['health'] as const,
  parseResume: (fileName: string) => ['parseResume', fileName] as const,
  analyzeResume: (fileName: string) => ['analyzeResume', fileName] as const,
  parseJobDescription: (text: string) => ['parseJobDescription', text] as const,
  match: (fileName: string, jdText?: string) => ['match', fileName, jdText] as const,
};

export function useHealthCheck(options?: UseQueryOptions<HealthCheck, Error>) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiService.healthCheck(),
    ...options,
  });
}

export function useParseResume(
  options?: UseMutationOptions<ParsedDocument, Error, { file: File; onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void }>
) {
  return useMutation({
    mutationFn: ({ file, onProgress }) => apiService.parseResume(file, onProgress),
    ...options,
  });
}

export function useAnalyzeResume(
  options?: UseMutationOptions<Resume, Error, { file: File; onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void }>
) {
  return useMutation({
    mutationFn: ({ file, onProgress }) => apiService.analyzeResume(file, onProgress),
    ...options,
  });
}

export function useParseJobDescription(
  options?: UseMutationOptions<ParsedJobDescription, Error, ParseJobDescriptionRequest>
) {
  return useMutation({
    mutationFn: (data) => apiService.parseJobDescription(data),
    ...options,
  });
}

export function useMatchResumeToJob(
  options?: UseMutationOptions<MatchResult, Error, { request: MatchRequest; onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void }>
) {
  return useMutation({
    mutationFn: ({ request, onProgress }) => apiService.matchResumeToJob(request, onProgress),
    ...options,
  });
}