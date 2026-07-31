'use client';

/**
 * useRole Custom Hook
 */

import { useMemo } from 'react';
import { useAuth } from './hooks';
import { hasRole } from './authorization';
import type { Role } from './roles';

/**
 * Hook to check if the authenticated user matches required role(s).
 *
 * @param {Role | Role[]} role - Required role or array of roles.
 * @returns {boolean} True if user possesses the required role.
 */
export function useRole(role: Role | Role[]): boolean {
  const { user } = useAuth();
  return useMemo(() => hasRole(user, role), [user, role]);
}
