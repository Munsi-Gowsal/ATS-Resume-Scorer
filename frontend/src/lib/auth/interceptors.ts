/**
 * Axios Authentication Interceptors Layer
 *
 * Requirements Met:
 * 1. Automatically attaches in-memory access token to request headers without overwriting existing Authorization headers.
 * 2. Intercepts 401 Unauthorized responses.
 * 3. Triggers single-flight token refresh via `refreshAccessToken()`.
 * 4. Persists the refreshed access token via `setAccessToken()` before retrying.
 * 5. Retries original request exactly once (_retry flag guard) to prevent infinite loops.
 * 6. Excludes auth endpoints (login, logout, refresh, register) from refresh retry cycles.
 * 7. Supports AbortController cancellation propagation (ignores AbortError / CanceledError without triggering session expiry broadcasts).
 * 8. Broadcasts a single `sessionExpired` event on unhandled refresh failure.
 * 9. Uses WeakSet to prevent duplicate interceptor registration on Axios instances.
 * 10. Complete SSR safety & cleanup teardown capability.
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { authBroadcastService } from './broadcast';
import { RefreshCanceledError, refreshAccessToken } from './refresh';
import { clearAccessToken, getAccessToken, setAccessToken } from './token-store';

/**
 * WeakSet to track registered AxiosInstance objects and prevent duplicate interceptor attachment.
 */
const registeredClients = new WeakSet<AxiosInstance>();

/**
 * Extended AxiosRequestConfig carrying custom retry state tracking.
 */
export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Auth endpoints that should be ignored during 401 auto-refresh retries.
 */
const EXCLUDED_AUTH_ENDPOINTS = [
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/refresh',
  '/api/v1/auth/register',
  '/login',
  '/logout',
  '/refresh',
  '/register',
];

/**
 * Checks if a given request URL matches any excluded auth endpoints.
 */
function isExcludedEndpoint(url?: string): boolean {
  if (!url) return false;
  return EXCLUDED_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

/**
 * Helper to check if an error is a request cancellation.
 */
function isCanceledError(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    error instanceof RefreshCanceledError ||
    (error as Error)?.name === 'AbortError' ||
    (error as Error)?.name === 'CanceledError'
  );
}

/**
 * Attaches authentication request and response interceptors to an Axios instance.
 *
 * @param {AxiosInstance} axiosInstance - Target Axios client instance.
 * @returns {() => void} Eject cleanup function detaching the interceptors.
 */
export function setupAuthInterceptors(axiosInstance: AxiosInstance): () => void {
  // Prevent duplicate interceptor registration
  if (registeredClients.has(axiosInstance)) {
    return () => {};
  }
  registeredClients.add(axiosInstance);

  // 1. Request Interceptor: Attach access token automatically if not present
  const requestInterceptorId = axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 2. Response Interceptor: Intercept 401 & single-flight retry
  const responseInterceptorId = axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

      // Handle cancellation errors cleanly without emitting auth failure events
      if (isCanceledError(error)) {
        return Promise.reject(error);
      }

      // SSR safety check & standard error validation
      if (typeof window === 'undefined' || !error.response || !originalRequest) {
        return Promise.reject(error);
      }

      const status = error.response.status;

      // Handle 401 Unauthorized errors for non-excluded endpoints that haven't been retried yet
      if (
        status === 401 &&
        !originalRequest._retry &&
        !isExcludedEndpoint(originalRequest.url)
      ) {
        // Flag to prevent infinite retry loops (retries exactly once)
        originalRequest._retry = true;

        try {
          // Perform single-flight token refresh
          const refreshResult = await refreshAccessToken();

          if (refreshResult && refreshResult.accessToken) {
            // Persist the refreshed access token into the in-memory store
            setAccessToken(refreshResult.accessToken);

            // Update Authorization header on original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${refreshResult.accessToken}`;
            }

            // Retry original request preserving headers, params, data, and timeout
            return await axiosInstance.request(originalRequest as AxiosRequestConfig);
          }
        } catch (refreshError) {
          // If the refresh operation was canceled, propagate without clearing session or broadcasting
          if (isCanceledError(refreshError)) {
            return Promise.reject(refreshError);
          }

          // Clear in-memory token state
          clearAccessToken();

          // Broadcast exactly ONE single sessionExpired event to avoid tab state conflicts
          authBroadcastService.broadcastSessionExpired();

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Return cleanup function to eject interceptors when unmounting or tearing down
  return () => {
    registeredClients.delete(axiosInstance);
    axiosInstance.interceptors.request.eject(requestInterceptorId);
    axiosInstance.interceptors.response.eject(responseInterceptorId);
  };
}
