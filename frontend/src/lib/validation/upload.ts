import { z } from 'zod';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * SSR-Safe File Instance Guard
 */
const isFile = (value: unknown): value is File => {
  return typeof File !== 'undefined' && value instanceof File;
};

/**
 * File Upload Validation Schema
 *
 * Rules:
 * - file: SSR-safe PDF format check
 * - file: maximum file size 10 MB
 */
export const UploadSchema = z.object({
  file: z
    .custom<File>(isFile, {
      message: 'File is required',
    })
    .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, {
      message: 'File size must not exceed 10 MB',
    })
    .refine(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'),
      {
        message: 'Only PDF files are allowed',
      }
    ),
});

export type UploadInput = z.infer<typeof UploadSchema>;
