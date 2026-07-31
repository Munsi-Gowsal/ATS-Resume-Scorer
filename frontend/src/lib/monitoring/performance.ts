/**
 * Performance Metrics & Latency Tracking
 */

import { logger } from '@/lib/logger';

export interface PerformanceMetric {
  name: string;
  durationMs: number;
  timestamp: string;
  context?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  recordMetric(name: string, durationMs: number, context?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      durationMs,
      timestamp: new Date().toISOString(),
      context,
    };
    this.metrics.push(metric);
    logger.debug(`[Performance] ${name} completed in ${durationMs.toFixed(2)}ms`, context);
  }

  async trackAsync<T>(name: string, fn: () => Promise<T>, context?: Record<string, unknown>): Promise<T> {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    try {
      return await fn();
    } finally {
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.recordMetric(name, end - start, context);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
