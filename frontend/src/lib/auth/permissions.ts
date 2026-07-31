/**
 * RBAC Permissions Definitions
 */

export const PERMISSIONS = {
  RESUME_READ: 'resume.read',
  RESUME_WRITE: 'resume.write',
  RESUME_DELETE: 'resume.delete',
  JOBS_READ: 'jobs.read',
  JOBS_WRITE: 'jobs.write',
  JOBS_DELETE: 'jobs.delete',
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
