import z from "zod";

export const liveSessionsSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    description: z.string().max(1024),
    scheduledAt: z.coerce.date().refine((date) => date > new Date(), {
        message: "Scheduled time must be in the future"
      }),    
    durationMinutes: z.number().min(15, "Duration must be at least 15 minutes").max(180, "Duration cannot exceed 180 minutes"),
    isActive: z.boolean().optional(),
})