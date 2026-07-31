'use client';

/**
 * usePermission Custom Hook
 */

import { useMemo } from 'react';
import { useAuth } from './hooks';
import { hasPermission, type PermissionMatchMode } from './authorization';
import type { Permission } from './permissions';

/**
 * Hook to check if the authenticated user has required permission(s).
 *
 * @param {Permission | Permission[]} permission - Required permission or array of permissions.
 * @param {PermissionMatchMode} mode - 'all' requires every permission; 'any' requires at least one.
 * @returns {boolean} True if user possesses the required permission(s).
 */
export function usePermission(
  permission: Permission | Permission[],
  mode: PermissionMatchMode = 'all'
): boolean {
  const { user } = useAuth();
  return useMemo(() => hasPermission(user, permission, mode), [user, permission, mode]);
}
