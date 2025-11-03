import { z } from "zod";
import { NextRequest } from "next/server";
import { passwordSchema } from "./passwordSchema";
import { sendResponse } from "@/utils/response";
export const registerSchema = z.object({
    fullName: z.string().nonempty("Full name is required").min(5, {message: "Must be 5 or more characters long"}),
    phoneNumber: z.string().nonempty("Phone number is required").min(8, {message: "phone number should be 8 or more characters long"}),
    userType: z.enum(["buyer", "farmer"]).optional(),
    password: passwordSchema
})

const validateData = async <T>(req: NextRequest, schema: z.Schema<T>) => {
    try{
        const data: T = await req.json();
        await schema.parseAsync(data);
        return data;

    } catch(err: unknown){
        if (err instanceof z.ZodError) {
            const validationMessages = err.issues.map(issue => `${issue.path.join('.')} is ${issue.message}`);
            console.log("validationMessages", validationMessages);
            return sendResponse(400, null, validationMessages.join(", "));
        }
        throw err;
    }

}

export const validateRegisterData = async (req: NextRequest) => {
    return validateData(req, registerSchema);
}