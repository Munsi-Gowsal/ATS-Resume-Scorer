/**
 * Centralized Logger Layer
 * Production-safe logging with log-level filtering and redaction.
 */

import type { LogLevel, LogContext, LogEntry } from './types';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'password',
  'secret',
  'cookie',
  'authorization',
]);

/**
 * Redacts sensitive fields from context objects.
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;
  const sanitized: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = '[Object]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

class Logger {
  private minLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: sanitizeContext(context),
    };
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.debug(JSON.stringify(this.formatLog('debug', message, context)));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.info(JSON.stringify(this.formatLog('info', message, context)));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(JSON.stringify(this.formatLog('warn', message, context)));
  }

  error(message: string, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    console.error(JSON.stringify(this.formatLog('error', message, context)));
  }
}

export const logger = new Logger();
