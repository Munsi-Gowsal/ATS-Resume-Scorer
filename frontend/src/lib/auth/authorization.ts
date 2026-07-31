/**
 * Authorization Helper Functions & RBAC Matchers
 */

import { ROLE_PERMISSIONS, type Role } from './roles';
import type { Permission } from './permissions';
import type { User } from './types';

export type PermissionMatchMode = 'all' | 'any';

/**
 * Normalizes a role string to lowercase Role type.
 */
export function normalizeRole(role: string): Role {
  return role.toLowerCase() as Role;
}

/**
 * Checks if a user has a specific role.
 *
 * @param {User | null} user - User object.
 * @param {Role | Role[]} requiredRole - Role or list of roles to check against.
 * @returns {boolean} True if user matches required role.
 */
export function hasRole(user: User | null, requiredRole: Role | Role[]): boolean {
  if (!user || !user.role) {
    return false;
  }

  const userRole = normalizeRole(user.role);
  if (Array.isArray(requiredRole)) {
    return requiredRole.map((r) => normalizeRole(r)).includes(userRole);
  }

  return userRole === normalizeRole(requiredRole);
}

/**
 * Checks if a user has specific permission(s) based on their assigned role.
 *
 * @param {User | null} user - User object.
 * @param {Permission | Permission[]} requiredPermission - Permission or list of permissions.
 * @param {PermissionMatchMode} mode - 'all' requires every permission; 'any' requires at least one.
 * @returns {boolean} True if user has the permission(s).
 */
export function hasPermission(
  user: User | null,
  requiredPermission: Permission | Permission[],
  mode: PermissionMatchMode = 'all'
): boolean {
  if (!user || !user.role) {
    return false;
  }

  const userRole = normalizeRole(user.role);
  const permissions = ROLE_PERMISSIONS[userRole] ?? [];

  if (Array.isArray(requiredPermission)) {
    if (mode === 'any') {
      return requiredPermission.some((perm) => permissions.includes(perm));
    }
    return requiredPermission.every((perm) => permissions.includes(perm));
  }

  return permissions.includes(requiredPermission);
}
