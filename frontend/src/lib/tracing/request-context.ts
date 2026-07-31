/**
 * Request Context Tracing Types & Store
 */

export interface RequestTracingContext {
  requestId: string;
  correlationId: string;
}

/**
 * Generates a unique UUID v4 format string for tracing.
 */
export function generateTracingId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
