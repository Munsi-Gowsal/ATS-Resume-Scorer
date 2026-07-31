import * as React from 'react';
import { RequireAuth } from '@/components/auth/require-auth';

/**
 * Protected App Layout
 *
 * Wraps all protected routes under the (app) route group inside <RequireAuth>.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
