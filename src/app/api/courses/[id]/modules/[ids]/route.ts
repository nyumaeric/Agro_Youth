import db from "@/server/db";
import { course, courseModules } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";
import { updateCourseProgress } from "../route";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; ids: string }> }
) => {
  try {
    const { ids } = await context.params;
    
    const module = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, ids))
      .limit(1);

    if (!module || module.length === 0) {
      return sendResponse(404, null, "Module not found");
    }

    return sendResponse(200, module[0], "Module fetched successfully");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";

    return sendResponse(500, null, errorMessage);
  }
};

export const PATCH = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; ids: string }> }
) => {
  try {
    const { ids } = await context.params;
    const requestBody = await request.json();
    const updateData = {
        ...requestBody,
        updatedAt: new Date(),
    };


    const updatedModule = await db.update(courseModules).set(updateData).where(eq(courseModules.id, ids)).returning();

    if (!updatedModule.length) {
      return sendResponse(404, null, "Module not found");
    }


    const courseId = updatedModule[0].courseId;

    const allModules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));


    const allModulesCompleted = allModules.every((module) => module.isCompleted);


    if (allModulesCompleted) {

       await db
        .update(course)
        .set({
          isCourseCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(course.id, courseId));

    } else {
      await db
        .update(course)
        .set({
          isCourseCompleted: false,
          updatedAt: new Date(),
        })
        .where(eq(course.id, courseId));
    }

    const userId = await getUserIdFromSession();
    
    if (userId) {
      const progressData = await updateCourseProgress(courseId, userId);
      
      return sendResponse(200, {
        message: "Module updated successfully",
        progress: progressData
      }, "Module updated successfully");
    }

    return sendResponse(200, null, 'Learning resource updated successfully');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";

    return sendResponse(500, null, errorMessage);
  }
};