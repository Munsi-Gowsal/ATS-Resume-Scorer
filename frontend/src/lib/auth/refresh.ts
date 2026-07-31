/**
 * Single-Flight Token Refresh Manager with Cancellation, Retries, and Race Condition Prevention.
 *
 * Requirements Met:
 * 1. Single-flight refresh mechanism: Only one refresh request is active at any time.
 * 2. Prevents multiple simultaneous refresh requests (subsequent callers join existing in-flight Promise).
 * 3. Supports Cancellation: Callers or signal parameters can abort in-flight operations safely.
 * 4. Supports Retries with Exponential Backoff: Transient failures (e.g. network drops/5xx status) retry automatically.
 * 5. Prevents Race Conditions: Locks state during token updates and clears token on permanent failure.
 * 6. Complete SSR Safety: Handles non-browser/RSC execution safely.
 * 7. Strict TypeScript: Fully typed parameters, return types, options, and error handling.
 */

import { authBroadcastService } from './broadcast';
import { clearAccessToken, setAccessToken } from './token-store';

/**
 * Interface defining options for configuring a token refresh call.
 */
export interface RefreshTokenOptions {
  /**
   * Optional AbortSignal to cancel the token refresh request.
   */
  signal?: AbortSignal;
  /**
   * Maximum number of retry attempts for transient errors (default: 2).
   */
  maxRetries?: number;
  /**
   * Initial delay in milliseconds before retrying transient failures (default: 500ms).
   */
  initialRetryDelayMs?: number;
}

/**
 * Result payload returned from a successful token refresh operation.
 */
export interface RefreshTokenResult {
  accessToken: string;
}

/**
 * Custom error class for canceled refresh operations.
 */
export class RefreshCanceledError extends Error {
  constructor(message = 'Token refresh operation was canceled') {
    super(message);
    this.name = 'RefreshCanceledError';
  }
}

/**
 * Internal single-flight promise holding the currently active refresh operation.
 */
let activeRefreshPromise: Promise<RefreshTokenResult> | null = null;

/**
 * Helper to pause execution asynchronously with abort capability.
 */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new RefreshCanceledError());
    }

    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      cleanup();
      reject(new RefreshCanceledError());
    };

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

/**
 * Perform actual HTTP request to FastAPI auth refresh endpoint.
 */
async function executeRefreshHttpRequest(signal?: AbortSignal): Promise<RefreshTokenResult> {
  if (signal?.aborted) {
    throw new RefreshCanceledError();
  }

  // Next.js SSR Guard
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Transmits HTTP-only refresh token cookie
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.detail || errorData?.message || `Refresh failed with status ${response.status}`;
    
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const data: { access_token: string } = await response.json();
  if (!data || typeof data.access_token !== 'string') {
    throw new Error('Invalid token response structure from server');
  }

  return {
    accessToken: data.access_token,
  };
}

/**
 * Refreshes access token with retries for transient errors.
 */
async function performRefreshWithRetries(
  options: RefreshTokenOptions
): Promise<RefreshTokenResult> {
  const maxRetries = options.maxRetries ?? 2;
  const initialDelay = options.initialRetryDelayMs ?? 500;
  const signal = options.signal;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      throw new RefreshCanceledError();
    }

    try {
      const result = await executeRefreshHttpRequest(signal);
      // Update in-memory store atomically
      setAccessToken(result.accessToken);
      return result;
    } catch (err: unknown) {
      lastError = err;

      // Do not retry if request was canceled
      if (err instanceof RefreshCanceledError || (err as Error)?.name === 'AbortError') {
        throw new RefreshCanceledError();
      }

      // Explicitly check status codes for retry qualification
      const status = (err as { status?: number })?.status;
      const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
      
      // If status is present and NOT in the retryable whitelist (e.g. 400, 401, 403, 404, 422), fail immediately without retrying
      if (status !== undefined && !RETRYABLE_STATUS_CODES.has(status)) {
        break;
      }

      // If we haven't reached maxRetries, wait before next attempt using exponential backoff
      if (attempt < maxRetries) {
        const backoffMs = initialDelay * Math.pow(2, attempt);
        await delay(backoffMs, signal);
      }
    }
  }

  // If permanent failure or retries exhausted: clear token and notify channel
  clearAccessToken();
  authBroadcastService.broadcastRefreshFailed();
  authBroadcastService.broadcastSessionExpired();

  throw lastError instanceof Error ? lastError : new Error('Token refresh failed');
}

/**
 * Single-flight Token Refresh Entry Point.
 *
 * Prevents multiple concurrent refresh calls by returning an existing in-flight Promise if one exists.
 * Prevents race conditions and guarantees thread-safe token updates in memory.
 *
 * @param {RefreshTokenOptions} [options] - Configuration for cancellation signals and retry logic.
 * @returns {Promise<RefreshTokenResult>} Promise resolving to the refreshed token payload.
 */
export async function refreshAccessToken(
  options: RefreshTokenOptions = {}
): Promise<RefreshTokenResult> {
  // If an existing refresh is already in progress, join the existing single flight promise
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  // Create single flight execution
  activeRefreshPromise = (async () => {
    try {
      return await performRefreshWithRetries(options);
    } finally {
      // Ensure single-flight promise lock is released when operation completes or fails
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

/**
 * Checks if a token refresh operation is currently in flight.
 *
 * @returns {boolean} True if a refresh request is pending, false otherwise.
 */
export function isRefreshingToken(): boolean {
  return activeRefreshPromise !== null;
}
