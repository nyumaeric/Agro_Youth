import db from "@/server/db";
import { roles, users } from "@/server/db/schema";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq, ne } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async(req: NextRequest) => {
    try {
        const userId = await getUserIdFromSession();
        if(!userId){
            return sendResponse(400, null, "Unauthorized")
        }
        const isAdmin = await checkIfUserIsAdmin();
        if(!isAdmin){
            return sendResponse(400, null, "Unauthorized")
        }
        const user = await db.select({
            id: users.id,
            fullName: users.fullName,
            userType: users.userType,
            isAnonymous: users.isAnonymous,
            anonymousName: users.anonymousName,
            phoneNumber: users.phoneNumber,
            createdAt: users.createdAt,
            role: users.role,
            roleName: roles.name 
          }).from(users)
          .leftJoin(roles, eq(roles.id, users.role))
          .where(ne(users.id, userId))
        return sendResponse(200,user, "All Users Successfully")
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
        return sendResponse(500, errorMessage, "Unexpected error occured")
    }
}