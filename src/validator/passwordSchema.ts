import { z } from "zod";

const passwordStrength = (password_hash: string) => {
    const message = [];
    if(password_hash.length < 8){
        message.push('Password must be at least 8 characters long')
    }
    if(password_hash.length > 16){
        message.push('Password must be at most 16 characters long')
    }
    if(!/[a-z]/.test(password_hash)){
        message.push("Password must contain at least one lowercase letter")
    }
    if(!/[A-Z]/.test(password_hash)){
        message.push("Password must contain at least one uppercase letter")
    }
    if(!/\d/.test(password_hash)){
        message.push("Password must contain at least one number")
    }
    if(!/[@$!%*?&#^)(><}{|\\://]/.test(password_hash)){
        message.push("Password must contain at least one special character")
    }
    if(message.length > 0){
        return `messages: ${message.join(', ')}` 
    }
    return null
}

export const passwordSchema = z.string().superRefine((password_hash, ctx) => {
    const strength = passwordStrength(password_hash);
    if(strength){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: strength
        })
    }
})