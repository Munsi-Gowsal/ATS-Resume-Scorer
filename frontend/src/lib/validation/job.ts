import { z } from 'zod';

/**
 * Job Description Validation Schema
 *
 * Rules:
 * - jobTitle: trimmed, maximum 120 characters
 * - company: trimmed, maximum 120 characters
 * - description: trimmed, maximum 10000 characters
 */
export const JobSchema = z.object({
  jobTitle: z
    .string()
    .trim()
    .min(1, 'Job title is required')
    .max(120, 'Job title must not exceed 120 characters'),
  company: z
    .string()
    .trim()
    .min(1, 'Company name is required')
    .max(120, 'Company name must not exceed 120 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Job description is required')
    .max(10000, 'Job description must not exceed 10000 characters'),
});

export type JobInput = z.infer<typeof JobSchema>;
