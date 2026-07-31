import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { setupAuthInterceptors } from '../auth/interceptors';
import type { ApiError } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface RequestConfigWithId extends InternalAxiosRequestConfig {
  _requestId?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    // Register Phase 9 auth interceptors onto underlying Axios instance
    setupAuthInterceptors(this.client);
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: RequestConfigWithId) => {
        const requestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        config._requestId = requestId;

        // Tracing headers
        config.headers.set('X-Request-ID', requestId);
        config.headers.set('X-Correlation-ID', requestId);

        if (!config.signal) {
          const controller = new AbortController();
          this.abortControllers.set(requestId, controller);
          config.signal = controller.signal;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        const requestId = (response.config as RequestConfigWithId)._requestId;
        if (requestId) {
          this.abortControllers.delete(requestId);
        }
        return response;
      },
      (error: AxiosError) => {
        const requestId = (error.config as RequestConfigWithId | undefined)?._requestId;
        if (requestId) {
          this.abortControllers.delete(requestId);
        }

        if (error.code === 'ECONNABORTED') {
          const apiError: ApiError = {
            message: 'Request timeout. Please try again.',
            status_code: 408,
          };
          return Promise.reject(apiError);
        }

        if (!error.response) {
          const apiError: ApiError = {
            message: 'Network error. Please check your connection.',
            status_code: 0,
          };
          return Promise.reject(apiError);
        }

        const responseData = error.response.data as { detail?: string; message?: string } | undefined;
        const apiError: ApiError = {
          message: responseData?.detail || responseData?.message || 'An error occurred',
          detail: responseData?.detail,
          status_code: error.response.status,
        };
        return Promise.reject(apiError);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }

  public abortRequest(method: string, url: string): void {
    const requestId = `${method.toUpperCase()}:${url}`;
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  public abortAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;