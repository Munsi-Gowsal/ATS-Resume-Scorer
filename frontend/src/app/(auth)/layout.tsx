import * as React from 'react';

/**
 * Public Auth Layout
 *
 * Renders public authentication pages directly without route protection.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
