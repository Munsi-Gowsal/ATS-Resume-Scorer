import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ParsedDocument, Resume, ParsedJobDescription, MatchResult, HealthCheck } from '@/types/api';
import type { ParseJobDescriptionRequest, MatchRequest } from './endpoints';
import type { User } from '../auth/types';

export const apiService = {
  async healthCheck(): Promise<HealthCheck> {
    return apiClient.get<HealthCheck>(API_ENDPOINTS.health);
  },

  async parseResume(file: File, onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void): Promise<ParsedDocument> {
    return apiClient.uploadFile<ParsedDocument>(API_ENDPOINTS.parseResume, file, onProgress);
  },

  async analyzeResume(file: File, onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void): Promise<Resume> {
    return apiClient.uploadFile<Resume>(API_ENDPOINTS.analyzeResume, file, onProgress);
  },

  async parseJobDescription(data: ParseJobDescriptionRequest): Promise<ParsedJobDescription> {
    return apiClient.post<ParsedJobDescription>(API_ENDPOINTS.parseJobDescription, data);
  },

  async matchResumeToJob(request: MatchRequest, onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void): Promise<MatchResult> {
    const formData = new FormData();
    formData.append('file', request.file);
    
    if (request.jd_text) {
      formData.append('jd_text', request.jd_text);
    }
    if (request.jd_file) {
      formData.append('jd_file', request.jd_file);
    }

    return apiClient.uploadFile<MatchResult>(API_ENDPOINTS.match, request.file, onProgress, {
      jd_text: request.jd_text || '',
    });
  },

  async login(credentials: { email: string; password: string }): Promise<{ access_token: string }> {
    return apiClient.post<{ access_token: string }>('/api/v1/auth/login', credentials);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/api/v1/auth/logout');
  },

  async getCurrentUser(token?: string): Promise<User> {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
    return apiClient.get<User>('/api/v1/auth/me', config);
  },
};

export default apiService;