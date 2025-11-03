import db from "@/server/db";
import { liveSessions } from "@/server/db/schema";
import { checkIfUserIsAdmin, getUserIdFromSession, getUserTypeFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq, sql, and, ne } from "drizzle-orm";

export const GET = async (request: Request) => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const userType = await getUserTypeFromSession();
    const isAdmin = await checkIfUserIsAdmin();


    const now = new Date();

    await db
      .update(liveSessions)
      .set({ 
        isActive: false,
        updatedAt: now 
      })
      .where(
        and(
          eq(liveSessions.isActive, true),
          sql`${liveSessions.scheduledAt} + (${liveSessions.durationMinutes} * interval '1 minute') < ${now}`
        )
      );
    
    let sessions;
    
    if (userType === "investor" || isAdmin) {
      sessions = await db
        .select()
        .from(liveSessions)
        .where(ne(liveSessions.hostId, userId));
    } else {
      sessions = await db.select().from(liveSessions);
    }
    
    return sendResponse(200, sessions, "Live sessions retrieved successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage); 
  }
};