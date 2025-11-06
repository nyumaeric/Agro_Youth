import db from "@/server/db";
import { certificates, course, courseModules, users } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { id } = await params;
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const checkIfCourseCompleted = await db.select().from(course).where(eq(course.id, id));
    
    if (!checkIfCourseCompleted || checkIfCourseCompleted.length === 0) {
      return sendResponse(400, null, "Course not found");
    }

    const courseData = checkIfCourseCompleted[0];
    const isCourseCompleted = courseData.isCourseCompleted;

    if (!isCourseCompleted) {
      return sendResponse(400, null, "Course not yet completed");
    }

    const existingCertificate = await db.select()
      .from(certificates)
      .where(
        and(
          eq(certificates.courseId, id),
          eq(certificates.userId, userId)
        )
      );

    if (existingCertificate && existingCertificate.length > 0) {
      return sendResponse(400, null, "Certificate already issued for this course");
    }

    const courseName = courseData.title || "";
    const completionMessage = `Congratulations on successfully completing ${courseName}! Your dedication and hard work have paid off. This certificate recognizes your achievement and the knowledge you've gained throughout this learning journey. Keep up the excellent work!`;

    await db.insert(certificates).values({
      userId: userId,
      courseId: id,
      completionMessage,
      completedAt: new Date(),
    });

    return sendResponse(200, completionMessage, "Certificate issued successfully");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};


export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const certificate = await db
      .select({
        id: certificates.id,
        courseId: certificates.courseId,
        courseTitle: course.title,
        courseDescription: course.description,
        courseLevel: course.level,
        courseCategory: course.category,
        courseLanguage: course.language,
        userName: users.fullName,
        timeToComplete: course.timeToComplete,
        courseInstructorFullName: users.fullName,
        completionMessage: certificates.completionMessage,
        completedAt: certificates.completedAt,
        createdAt: certificates.issuedAt,
      })
      .from(certificates)
      .leftJoin(course, eq(certificates.courseId, course.id))
      .leftJoin(users, eq(course.createdId, users.id))
      .where(
        and(
          eq(certificates.courseId, id),
          eq(certificates.userId, userId)
        )
      )
      .limit(1);

    if (!certificate || certificate.length === 0) {
      return sendResponse(404, null, "Certificate not found");
    }

    return sendResponse(200, certificate[0], "Certificate retrieved successfully");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ids: string }> }
) => {
  try {
    const { id: courseId, ids: moduleId } = await params;
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const body = await req.json();
    const { isCompleted } = body;

    await db
      .update(courseModules)
      .set({ isCompleted })
      .where(eq(courseModules.id, moduleId));

    const allModules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));

    const allCompleted = allModules.every((module) => module.isCompleted);

    if (allCompleted && allModules.length > 0) {
      await db
        .update(course)
        .set({ isCourseCompleted: true })
        .where(eq(course.id, courseId));
    } else {
      await db
        .update(course)
        .set({ isCourseCompleted: false })
        .where(eq(course.id, courseId));
    }

    return sendResponse(200, null, "Module updated successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};