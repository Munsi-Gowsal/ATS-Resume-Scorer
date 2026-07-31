/**
 * Typed Application Errors
 */

export type ErrorCategory = 'auth' | 'network' | 'validation' | 'server' | 'unknown';

export class AppError extends Error {
  public readonly category: ErrorCategory;
  public readonly statusCode?: number;
  public readonly isRetryable: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    category: ErrorCategory = 'unknown',
    statusCode?: number,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    this.timestamp = new Date().toISOString();

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
