import db from "@/server/db";
import { enrollments } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
export const DELETE = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: courseId } = await params;
      const userId = await getUserIdFromSession();
  
      if (!userId) {
        return sendResponse(401, null, "Unauthorized. Please login.");
      }
  
      // Check if enrolled
      const existingEnrollment = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.courseId, courseId),
            eq(enrollments.userId, userId)
          )
        )
        .limit(1);
  
      if (existingEnrollment.length === 0) {
        return sendResponse(404, null, "Not enrolled in this course");
      }
  
      // Delete enrollment
      await db
        .delete(enrollments)
        .where(
          and(
            eq(enrollments.courseId, courseId),
            eq(enrollments.userId, userId)
          )
        );
  
      return sendResponse(200, null, "Successfully unenrolled from course");
    } catch (error) {
      console.error("Unenrollment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to unenroll from course";
      return sendResponse(500, null, errorMessage);
    }
  };