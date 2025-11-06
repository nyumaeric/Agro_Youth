import { z } from 'zod';

export const courseModuleValidation = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description must not exceed 500 characters"),

  contentType: z
    .enum(["text", "video"])
    .default("text"),

  textContent: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .optional(),

  durationTime: z
    .string()
    .regex(/^\d+\s?(minutes?|hours?|days?|weeks?|months?)$/i, "Time format example: '3 hours' or '2 weeks'"),

  isCompleted: z.boolean().default(false)
});
