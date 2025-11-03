import { z } from 'zod';

export const courseValidation = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(1000, "Description must not exceed 1000 characters"),

  timeToComplete: z
    .string()
    .regex(/^\d+\s?(hours?|days?|weeks?|months?)$/i, "Time format example: '3 hours' or '2 weeks'")
    .optional(),

  category: z
    .enum(["Cropping", "Livestock", "Agroforestry", "Irrigation", "Soil Health", "Pest Management"])
    .default("Cropping"),

  level: z
    .enum(["Beginner", "Intermediate", "Advanced"])
    .default("Beginner"),

  language: z
    .enum(["English", "French", "Kinyarwanda"])
    .default("English")
});
