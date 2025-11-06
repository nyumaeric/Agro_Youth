import db from "@/server/db";
import { course, courseModules } from "@/server/db/schema";
import { uploadVideo } from "@/utils/cloudinary";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
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
            content: courseModules.textContent,
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

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return sendResponse(400, null, "Course ID is required");
    }

    const userId = await getUserIdFromSession();
    const isAdmin = await checkIfUserIsAdmin();

    if (!isAdmin || !userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const timeToComplete = formData.get("timeToComplete") as string;
    const level = formData.get("level") as string;
    const category = formData.get("category") as string;
    const language = formData.get("language") as string;
    const contentType = formData.get("contentType") as string;
    const textContent = formData.get("textContent") as string | null;
    const videoFile = formData.get("video") as File | null;
    const isDownloadable = formData.get("isDownloadable") === "true";

    // Check if course exists and belongs to user
    const [existingCourse] = await db
      .select()
      .from(course)
      .where(eq(course.id, id))
      .limit(1);

    if (!existingCourse) {
      return sendResponse(404, null, "Course not found");
    }

    if (existingCourse.createdId !== userId) {
      return sendResponse(403, null, "You don't have permission to update this course");
    }

    let contentUrl = existingCourse.contentUrl;

    if (contentType === "video" && videoFile) {
      try {
        contentUrl = await uploadVideo(videoFile);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Video upload failed";
        return sendResponse(500, null, errorMessage);
      }
    }

    const [updatedCourse] = await db
      .update(course)
      .set({
        title,
        description,
        timeToComplete,
        level: level as any,
        category: category as any,
        language: language as any,
        contentType: contentType as any,
        contentUrl: contentType === "video" ? contentUrl : null,
        textContent: contentType === "text" ? textContent : null,
        isDownloadable,
        updatedAt: new Date(),
      })
      .where(eq(course.id, id))
      .returning();

    return sendResponse(200, updatedCourse, "Course updated successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

// DELETE - Delete Course
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return sendResponse(400, null, "Course ID is required");
    }

    const userId = await getUserIdFromSession();
    const isAdmin = await checkIfUserIsAdmin();

    if (!isAdmin || !userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    // Check if course exists and belongs to user
    const [existingCourse] = await db
      .select()
      .from(course)
      .where(eq(course.id, id))
      .limit(1);

    if (!existingCourse) {
      return sendResponse(404, null, "Course not found");
    }

    if (existingCourse.createdId !== userId) {
      return sendResponse(403, null, "You don't have permission to delete this course");
    }

    await db.delete(course).where(eq(course.id, id));

    return sendResponse(200, null, "Course deleted successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

