import db from "@/server/db";
import { certificates, course, courseModules, courseProgress, users } from "@/server/db/schema";
import { uploadVideo } from "@/utils/cloudinary";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { courseModuleValidation } from "@/validator/courseModule";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";



export async function updateCourseProgress(courseId: string, userId: string) {
  try {
    const allModules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));

    const completedCount = allModules.filter(module => module.isCompleted).length;
    const totalModules = allModules.length;

    const progressPercentage = totalModules > 0 
      ? Math.round((completedCount / totalModules) * 100) 
      : 0;

    const [existingProgress] = await db
      .select()
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.courseId, courseId),
          eq(courseProgress.userId, userId)
        )
      );

    if (existingProgress) {
      await db
        .update(courseProgress)
        .set({
          completedModules: completedCount,
          progressPercentage,
          updatedAt: new Date(),
        })
        .where(eq(courseProgress.id, existingProgress.id));
    } else {
      await db.insert(courseProgress).values({
        userId,
        courseId,
        completedModules: completedCount,
        progressPercentage,
      });
    }

    return { completedCount, totalModules, progressPercentage };
  } catch (error) {
    throw error;
  }
}

export const POST = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  try {
     const { id } = await params;

     const [existingCourse] = await db.select().from(course).where(eq(course.id, id));

     if(!existingCourse){
      return sendResponse(400, null, "Course not found");
     }

     const userId = await getUserIdFromSession();
     const isAdmin = await checkIfUserIsAdmin();
 
     if (!isAdmin || !userId) {
       return sendResponse(401, null, "Unauthorized");
     }

     const formData = await req.formData();

     // Extract form fields
     const title = formData.get("title") as string;
     const description = formData.get("description") as string;
     const durationTime = formData.get("durationTime") as string;
     const contentType = formData.get("contentType") as string;
     const textContent = formData.get("textContent") as string | null;
     const videoFile = formData.get("video") as File | null;
     const isCompleted = formData.get("isCompleted") === "true";

     // Validate basic fields
     const validationData = {
      title,
      description,
      durationTime,
      contentType,
      textContent: textContent || undefined,
      isCompleted
     };

     const validation = courseModuleValidation.safeParse(validationData);
     
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

     const [newModule] = await db.insert(courseModules).values({
       courseId: id,
       title: validation.data.title,
       description: validation.data.description,
       durationTime: validation.data.durationTime,
       contentType: validation.data.contentType as any,
       contentUrl: contentUrl,
       textContent: validation.data.contentType === "text" ? validation.data.textContent : null,
       isCompleted: validation.data.isCompleted,
     }).returning();

     await updateCourseProgress(id, userId);

     return sendResponse(200, newModule, "Module created successfully");

  } catch (error) {
    console.error("Module creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

// export const GET = async (
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) => {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return sendResponse(400, null, "Course ID is required");
//     }

//     const courseModule = await db
//       .select()
//       .from(courseModules)
//       .where(eq(courseModules.courseId, id))
//       .orderBy(desc(courseModules.createdAt));

//     if (!courseModule || courseModule.length === 0) {
//       return sendResponse(404, [], "No modules found for this course");
//     }

//     return sendResponse(200, courseModule, "Modules retrieved successfully");
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "An error occurred";
//     return sendResponse(500, null, errorMessage);
//   }
// };

export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    // Create aliases for the users table
    const certificateUser = users;
    const courseInstructor = users;

    const certificate = await db
      .select({
        id: certificates.id,
        courseId: certificates.courseId,
        courseTitle: course.title,
        courseDescription: course.description,
        courseLevel: course.level,
        courseCategory: course.category,
        courseLanguage: course.language,
        timeToComplete: course.timeToComplete,
        completionMessage: certificates.completionMessage,
        completedAt: certificates.completedAt,
        createdAt: certificates.issuedAt,
      })
      .from(certificates)
      .leftJoin(course, eq(certificates.courseId, course.id))
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

    // Get user name separately
    const [user] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get instructor name
    const [instructor] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .leftJoin(course, eq(course.createdId, users.id))
      .where(eq(course.id, id))
      .limit(1);

    const result = {
      ...certificate[0],
      userName: user?.fullName || "Unknown User",
      courseInstructorFullName: instructor?.fullName || "Unknown Instructor",
    };

    return sendResponse(200, result, "Certificate retrieved successfully");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};