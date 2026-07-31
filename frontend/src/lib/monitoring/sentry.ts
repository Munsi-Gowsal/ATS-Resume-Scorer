/**
 * Sentry Integration
 *
 * SSR-safe, client-safe, no-duplicate-initialization Sentry wrapper.
 * Reads SENTRY_DSN from environment. When DSN is absent, Sentry is
 * configured but all calls are silently no-ops (SDK default behavior).
 *
 * Usage:
 *   import { captureException, captureApiError } from '@/lib/monitoring/sentry';
 *   captureException(error, { context });
 *   captureApiError(axiosError, { endpoint: '/api/v1/resume' });
 */

import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Minimal Sentry-compatible interface so the module compiles without
// @sentry/nextjs installed. Once the package is added, replace with:
//   import * as Sentry from '@sentry/nextjs';
// ---------------------------------------------------------------------------
interface SentryExtra {
  [key: string]: unknown;
}

interface SentryScope {
  setExtra(key: string, value: unknown): void;
  setTag(key: string, value: string): void;
}

interface SentryClient {
  init(options: SentryInitOptions): void;
  captureException(error: unknown, context?: { extra?: SentryExtra }): string;
  withScope(cb: (scope: SentryScope) => void): void;
  isInitialized(): boolean;
}

interface SentryInitOptions {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  debug: boolean;
}

// ---------------------------------------------------------------------------
// Singleton initialization guard — prevents double-init in React Strict Mode
// and Next.js hot-reload cycles.
// ---------------------------------------------------------------------------
let _initialized = false;

function getSentry(): SentryClient | null {
  // Use a runtime-computed name to prevent Turbopack/webpack from attempting
  // static module resolution of this optional peer dependency.
  const pkg = `@sentry` + `/nextjs`;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(pkg) as SentryClient;
  } catch {
    return null;
  }
}

/**
 * Initialize Sentry once for both server and client contexts.
 * Call this from instrumentation.ts (server) and _app / layout (client).
 */
export function initSentry(): void {
  if (_initialized) return;

  const dsn = process.env.SENTRY_DSN ?? "";
  const sentry = getSentry();

  if (!sentry) {
    logger.warn("[Sentry] @sentry/nextjs not installed — Sentry is disabled.");
    _initialized = true;
    return;
  }

  if (!dsn) {
    logger.warn("[Sentry] SENTRY_DSN not set — Sentry is disabled.");
    _initialized = true;
    return;
  }

  sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === "development",
  });

  _initialized = true;
  logger.info("[Sentry] Initialized.", {
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  });
}

/**
 * Capture an arbitrary exception in Sentry.
 * Falls back to logger.error when Sentry is unavailable.
 */
export function captureException(
  error: unknown,
  extra?: SentryExtra
): void {
  const sentry = getSentry();

  if (!sentry || !_initialized) {
    logger.error("[Sentry] captureException (Sentry unavailable)", {
      error: error instanceof Error ? error.message : String(error),
      ...extra,
    });
    return;
  }

  sentry.withScope((scope: SentryScope) => {
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => scope.setExtra(k, v));
    }
    sentry.captureException(error);
  });
}

/**
 * Capture an API-layer error with endpoint context.
 */
export function captureApiError(
  error: unknown,
  context: { endpoint: string; status?: number; method?: string }
): void {
  const sentry = getSentry();

  if (!sentry || !_initialized) {
    logger.error("[Sentry] captureApiError (Sentry unavailable)", {
      error: error instanceof Error ? error.message : String(error),
      ...context,
    });
    return;
  }

  sentry.withScope((scope: SentryScope) => {
    scope.setTag("api.endpoint", context.endpoint);
    if (context.method) scope.setTag("api.method", context.method);
    if (context.status != null) {
      scope.setExtra("httpStatus", context.status);
    }
    sentry.captureException(error);
  });
}
