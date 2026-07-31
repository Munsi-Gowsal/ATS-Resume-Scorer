import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  jobTitle: z.string().min(2, "Please enter your job title"),
  company: z.string().min(2, "Please enter your company or organization name"),
});

export const apiKeySchema = z.object({
  keyName: z.string().min(2, "Key identifier label required"),
  apiSecret: z
    .string()
    .min(10, "API Secret must be at least 10 characters")
    .refine((val) => val.startsWith("sk-"), "API key should start with 'sk-'"),
});

export const atsPreferencesSchema = z.object({
  strictnessLevel: z.number().min(1).max(5),
  enableFuzzyMatching: z.boolean(),
  defaultIndustry: z.string(),
  minimumMatchScoreThreshold: z.number().min(40).max(95),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ApiKeyFormData = z.infer<typeof apiKeySchema>;
export type AtsPreferencesFormData = z.infer<typeof atsPreferencesSchema>;
