'use client';

/**
 * RequireRole Component
 */

import * as React from 'react';
import { useRole } from '@/lib/auth/useRole';
import type { Role } from '@/lib/auth/roles';

export interface RequireRoleProps {
  children: React.ReactNode;
  role: Role | Role[];
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children if user possesses required role(s).
 */
export function RequireRole({
  children,
  role,
  fallback = null,
}: RequireRoleProps): React.ReactNode {
  const allowed = useRole(role);

  if (!allowed) {
    return fallback;
  }

  return children;
}

export default RequireRole;
