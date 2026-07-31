/**
 * Request Tracing Manager
 */

import { generateTracingId, type RequestTracingContext } from './request-context';

export class TracingManager {
  private static correlationId: string | null = null;

  static getCorrelationId(): string {
    if (!this.correlationId) {
      this.correlationId = generateTracingId();
    }
    return this.correlationId;
  }

  static createRequestContext(): RequestTracingContext {
    return {
      requestId: generateTracingId(),
      correlationId: this.getCorrelationId(),
    };
  }
}

export * from './request-context';
