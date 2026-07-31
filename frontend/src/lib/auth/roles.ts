/**
 * RBAC Roles and Role-to-Permission Mappings
 */

import { PERMISSIONS, type Permission } from './permissions';

export const ROLES = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Explicit role-to-permission mapping dictionary.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.RESUME_READ,
    PERMISSIONS.RESUME_WRITE,
    PERMISSIONS.RESUME_DELETE,
    PERMISSIONS.JOBS_READ,
    PERMISSIONS.JOBS_WRITE,
    PERMISSIONS.JOBS_DELETE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
  ],
  [ROLES.RECRUITER]: [
    PERMISSIONS.RESUME_READ,
    PERMISSIONS.RESUME_WRITE,
    PERMISSIONS.JOBS_READ,
    PERMISSIONS.JOBS_WRITE,
    PERMISSIONS.JOBS_DELETE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.RESUME_READ,
    PERMISSIONS.RESUME_WRITE,
    PERMISSIONS.JOBS_READ,
  ],
};
