import db from "@/server/db";
import { users, roles } from "@/server/db/schema"; 
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async(req: NextRequest) => {
    void req;
    try {

        const userId = await getUserIdFromSession();
        if (!userId) {
            return sendResponse(400, null , "Unauthorized")
        }
        const userInfo = await db
            .select({
                id: users.id,
                fullName: users.fullName,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                role: roles.name
            })
            .from(users)
            .leftJoin(roles, eq(users.role, roles.id)) 
            .where(eq(users.id, userId))
            .limit(1);

        return sendResponse(
            200, userInfo , "Profile fetched successfully");

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
        return sendResponse(500, errorMessage, "Unexpected error occured")
    }
}