import db from "@/server/db";
import { enrollments } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";


export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: courseId } = await params;
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized. Please login.");
    }

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

    if (existingEnrollment.length > 0) {
      return sendResponse(400, null, "Already enrolled in this course");
    }

    // Create new enrollment
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        courseId: courseId,
        userId: userId,
        enrolledAt: new Date(),
      })
      .returning();

    return sendResponse(201, newEnrollment, "Successfully enrolled in course");
  } catch (error) {
    console.error("Enrollment error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to enroll in course";
    return sendResponse(500, null, errorMessage);
  }
};