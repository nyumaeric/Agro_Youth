import db from "@/server/db";
import { course, courseModules } from "@/server/db/schema";
import { sendResponse } from "@/utils/response";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        
        const [courseData] = await db
          .select({
            id: course.id,
            createdId: course.createdId,
            title: course.title,
            description: course.description,
            timeToComplete: course.timeToComplete,
            level: course.level,
            category: course.category,
            language: course.language,
            isCourseCompleted: course.isCourseCompleted,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            moduleCount: sql<number>`COUNT(${courseModules.id})::int`.as('module_count')
          })
          .from(course)
          .leftJoin(courseModules, eq(course.id, courseModules.courseId))
          .where(eq(course.id, id))
          .groupBy(course.id);
  
        if (!courseData) {
          return sendResponse(404, null, "Course not found");
        }

        const modules = await db
          .select({
            id: courseModules.id,
            title: courseModules.title,
            content: courseModules.content,
            durationTime: courseModules.durationTime,
            isCompleted: courseModules.isCompleted,
            createdAt: courseModules.createdAt,
            updatedAt: courseModules.updatedAt,
          })
          .from(courseModules)
          .where(eq(courseModules.courseId, id))
          .orderBy(courseModules.createdAt);

        const response = {
          ...courseData,
          modules
        };
  
        return sendResponse(200, response, "Course fetched successfully");
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return sendResponse(500, null, errorMessage); 
    }
}

