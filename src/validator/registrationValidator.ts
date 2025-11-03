import { z } from "zod";
import { NextRequest } from "next/server";
import { passwordSchema } from "./passwordSchema";
import { sendResponse } from "@/utils/response";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(5, "Must be 5 or more characters long"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+?250|0)?[7][0-9]{8}$/, "Invalid Rwandan phone number format"),
  userType: z.enum(["buyer", "farmer", "investor"]).optional(),
  password: passwordSchema
});

const validateData = async <T>(req: NextRequest, schema: z.Schema<T>) => {
  try {
    let data: any;
    try {
      data = await req.json();
    } catch (jsonError) {
      return sendResponse(400, null, "Invalid JSON format in request body");
    }

    if (!data || typeof data !== 'object') {
      return sendResponse(400, null, "Request body cannot be empty");
    }

    const validatedData = await schema.parseAsync(data);
    return validatedData as T;
    
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const validationMessages = err.issues.map(
        issue => `${issue.path.join('.') || 'Field'}: ${issue.message}`
      );
      return sendResponse(400, null, validationMessages.join(", "));
    }
    throw err;
  }
}

export const validateRegisterData = async (req: NextRequest) => {
  return validateData(req, registerSchema);
}