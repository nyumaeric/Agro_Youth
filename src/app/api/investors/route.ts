import db from "@/server/db";
import { users } from "@/server/db/schema";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";

export const GET  = async()=> {
    try {
        const investor = "investor";
        const allInvestor = await db.select().from(users).where(eq(users.userType, investor));
        return sendResponse(200, allInvestor, "All investors returned successfully")
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return sendResponse(500, null, errorMessage);   
    }
}