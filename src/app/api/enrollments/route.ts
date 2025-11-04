import { NextRequest } from "next/server";
import db from "@/server/db";
import { course, enrollments, courseModules } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq, sql, desc } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const userEnrollments = await db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        enrolledAt: enrollments.enrolledAt,
        title: course.title,
        description: course.description,
        timeToComplete: course.timeToComplete,
        level: course.level,
        category: course.category,
        language: course.language,
        isCourseCompleted: course.isCourseCompleted,
        isDownloadable: course.isDownloadable,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        createdId: course.createdId,
        moduleCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${courseModules} 
          WHERE ${courseModules.courseId} = ${course.id}
        )`.as('moduleCount')
      })
      .from(enrollments)
      .leftJoin(course, eq(enrollments.courseId, course.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));

    return sendResponse(200, userEnrollments, "Enrollments fetched successfully");
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};