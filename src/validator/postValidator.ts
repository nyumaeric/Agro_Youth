import { z } from "zod"; 

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  contentType: z.enum(["text", "image", "video", "link"]),
  textContent: z.string().optional(),
  mediaUrl: z.string().url().max(1024).optional(),
  mediaAlt: z.string().max(255).optional(),
  linkUrl: z.string().url().max(1024).optional(),
  linkDescription: z.string().optional(),
  linkPreviewImage: z.string().url().max(1024).optional(),
});