'use client';

/**
 * React Error Boundary Component
 */

import * as React from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('React ErrorBoundary caught an exception', {
      errorName: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div role="alert" className="p-6 bg-red-950/20 border border-red-500/30 rounded-xl text-red-200">
          <h2 className="text-lg font-bold">Something went wrong</h2>
          <p className="text-sm mt-1 text-red-300">An unexpected error occurred in this view.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
