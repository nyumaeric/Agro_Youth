import { z } from "zod";
import { passwordSchema } from "./passwordSchema";

export const loginSchema = z.object({
  phoneNumber: z.string().nonempty("Phone number is required").min(8, {message: "phone number should be 8 or more characters long"}),
  password: passwordSchema,
});