import { z } from 'zod';

/**
 * Login Validation Schema
 *
 * Rules:
 * - email: trimmed, valid email address format
 * - password: minimum length 8 characters
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
