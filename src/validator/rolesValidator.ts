import { z } from "zod";
export const roleSchema = z.object({
    name: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Descriptiom is required."),
});

export type RoleInput = z.infer<typeof roleSchema>;