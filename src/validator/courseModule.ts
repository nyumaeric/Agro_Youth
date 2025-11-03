import { z } from 'zod';

export const courseModuleValidation = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters"),

  content: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .max(1000, "Content must not exceed 1000 characters"),

  durationTime: z
    .string()
    .regex(/^\d+\s?(minutes ? hours?|days?|weeks?|months?)$/i, "Time format example: '3 hours' or '2 weeks'")
    .optional(),
  isCompleted: z.boolean().default(false)
});
