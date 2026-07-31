import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export const uploadFormSchema = z.object({
  resumeFile: z
    .custom<File>((val) => val instanceof File, "Please select a resume file")
    .refine((file) => file && file.size <= MAX_FILE_SIZE, "File size must be under 5MB")
    .refine(
      (file) => file && ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .pdf and .docx file formats are supported"
    ),
  targetRole: z.string().min(2, "Please enter a target job title or role name"),
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters to compute skill gap matrix"),
});

export type UploadFormData = z.infer<typeof uploadFormSchema>;
