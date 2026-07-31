'use client';

/**
 * RequirePermission Component
 */

import * as React from 'react';
import { usePermission } from '@/lib/auth/usePermission';
import type { Permission } from '@/lib/auth/permissions';
import type { PermissionMatchMode } from '@/lib/auth/authorization';

export interface RequirePermissionProps {
  children: React.ReactNode;
  permission: Permission | Permission[];
  mode?: PermissionMatchMode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children if user possesses required permission(s).
 */
export function RequirePermission({
  children,
  permission,
  mode = 'all',
  fallback = null,
}: RequirePermissionProps): React.ReactNode {
  const allowed = usePermission(permission, mode);

  if (!allowed) {
    return fallback;
  }

  return children;
}

export default RequirePermission;
