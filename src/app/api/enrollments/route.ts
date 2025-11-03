import { NextRequest } from "next/server";
import db from "@/server/db";
import { enrollments } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const userEnrollments = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId));

    return sendResponse(200, userEnrollments, "Enrollments fetched successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};