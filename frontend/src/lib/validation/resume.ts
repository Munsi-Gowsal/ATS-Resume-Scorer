import { z } from 'zod';

/**
 * Resume Details Validation Schema
 *
 * Rules:
 * - title: trimmed, max 120 characters
 * - description: trimmed, required, max 5000 characters
 */
export const ResumeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must not exceed 120 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description must not exceed 5000 characters'),
});

export type ResumeInput = z.infer<typeof ResumeSchema>;
