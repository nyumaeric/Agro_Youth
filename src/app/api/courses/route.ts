
import db from "@/server/db";
import { course, courseModules } from "@/server/db/schema";
import { uploadVideo } from "@/utils/cloudinary";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { getPaginationParams } from "@/utils/pagination";
import { sendResponse } from "@/utils/response";
import { courseValidation } from "@/validator/coursesSchema";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
      const userId = await getUserIdFromSession();
      const isAdmin = await checkIfUserIsAdmin();

      if (!isAdmin) {
          return sendResponse(401, null, "Unauthorized");
      }

      const formData = await req.formData();
      
      // Extract form fields
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

      // Validate basic fields
      const validationData = {
          title,
          description,
          timeToComplete,
          level,
          category,
          language,
          contentType,
          textContent: textContent || undefined,
          isDownloadable
      };

      const validation = courseValidation.safeParse(validationData);
      
      if (!validation.success) {
          const errors = Object.fromEntries(
              Object.entries(validation.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
          );
          return NextResponse.json(
              { status: "Error!", errors, message: "Validation failed" },
              { status: 400 }
          );
      }

      let contentUrl: string | null = null;

      // Handle video upload
      if (contentType === "video") {
          if (!videoFile) {
              return sendResponse(400, null, "Video file is required when content type is video");
          }

          // Validate video file
          const validVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"];
          if (!validVideoTypes.includes(videoFile.type)) {
              return sendResponse(400, null, "Invalid video format. Supported formats: MP4, MPEG, MOV, AVI");
          }

          // Check file size (max 100MB)
          const maxSize = 100 * 1024 * 1024; // 100MB
          if (videoFile.size > maxSize) {
              return sendResponse(400, null, "Video file size must be less than 100MB");
          }

          // Upload to Cloudinary
          try {
              contentUrl = await uploadVideo(videoFile);
          } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Video upload failed";
              return sendResponse(500, null, errorMessage);
          }
      }

      const [newCourse] = await db.insert(course).values({
          createdId: userId as string,
          title: validation.data.title,
          description: validation.data.description,
          level: validation.data.level as any,
          category: validation.data.category as any,
          language: validation.data.language as any,
          timeToComplete: validation.data.timeToComplete,
          contentType: validation.data.contentType as any,
          contentUrl: contentUrl,
          textContent: validation.data.contentType === "text" ? validation.data.textContent : null,
          isDownloadable: validation.data.isDownloadable,
          isCourseCompleted: false,
      }).returning();

      return sendResponse(200, newCourse, "Course created successfully");

  } catch (error) {
      console.error("Course creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      return sendResponse(500, null, errorMessage);
  }
};


type CountResult = { count: number };
 
export const GET = async (req: NextRequest) => {
  try {
    const pagination = await getPaginationParams(req);
    let { page, offset} = pagination;
    const { limit } = pagination;

    const totalResult = await db.execute<CountResult>(
      sql`SELECT COUNT(*)::int AS count FROM ${course}`
    );

    const totalCount = totalResult.rows[0]?.count ?? 0;
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    if (page > totalPages) {
      page = 1;
      offset = 0;
    }

    const paginatedCourses = await db
    .select({
      id: course.id,
      createdId: course.createdId,
      title: course.title,
      description: course.description,
      timeToComplete: course.timeToComplete,
      level: course.level,
      category: course.category,
      isCompleted: course.isCourseCompleted,
      language: course.language,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      moduleCount: sql<number>`COUNT(${courseModules.id})::int`.as('module_count')
    })
    .from(course)
    .leftJoin(courseModules, eq(course.id, courseModules.courseId))
    .groupBy(course.id)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(course.createdAt));
    return sendResponse(
      200,
      {
        data: paginatedCourses,
        count: paginatedCourses.length,
        page,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      paginatedCourses.length === 0 ? "No course found" : "courses fetched successfully"
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
}