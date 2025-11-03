import { z } from "zod"; 

export const createProductSchema = z.object({
    cropName: z.string().min(1, "Crop Name is required").max(255, "Crop Name too long"),
    quantity: z.number().min(1, "Quantity must be at least 1").optional(),
    unit: z.string().optional(),
    price: z.number().min(0, "Price must be at least 0").optional(),
    description: z.string().max(255).optional(),
    location: z.string().max(1024).optional(),
    isAvailable: z.boolean().optional(),
});