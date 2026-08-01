import * as React from 'react';

/**
 * Protected App Layout
 *
 * RequireAuth temporarily disabled — backend auth not yet available.
 * Re-enable by wrapping {children} in <RequireAuth> once the backend
 * supports /auth/login and /auth/refresh endpoints.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
