import db from "@/server/db";
import { course, courseModules } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { and, eq } from "drizzle-orm";
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

    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }


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
        .where(
          and(
            eq(course.id, courseId),
            eq(course.createdId, userId)
          )
        );

    } else {
      await db
        .update(course)
        .set({
          isCourseCompleted: false,
          updatedAt: new Date(),
        })
        .where(eq(course.id, courseId));
    }


    // if (userId) {
    //   const progressData = await updateCourseProgress(courseId, userId);
      
    //   return sendResponse(200, {
    //     message: "Module updated successfully",
    //     progress: progressData
    //   }, "Module updated successfully");
    // }

    return sendResponse(200, null, 'Learning resource updated successfully');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";

    return sendResponse(500, null, errorMessage);
  }
};




// const updateCourseProgress = async (userId: string, courseId: string) => {
//   // Get all modules for the course
//   const allModules = await db
//     .select()
//     .from(courseModules)
//     .where(eq(courseModules.courseId, courseId));

//   const totalModules = allModules.length;

//   // Count completed modules for this course (since modules have isCompleted field)
//   const completedModulesCount = allModules.filter(m => m.isCompleted).length;

//   // Calculate progress percentage
//   const progressPercentage = totalModules > 0 
//     ? Math.round((completedModulesCount / totalModules) * 100) 
//     : 0;

//   const now = new Date();

//   // Check if course progress exists
//   const existingCourseProgress = await db
//     .select()
//     .from(courseProgress)
//     .where(
//       and(
//         eq(courseProgress.userId, userId),
//         eq(courseProgress.courseId, courseId)
//       )
//     )
//     .limit(1);

//   if (existingCourseProgress.length > 0) {
//     // Update existing course progress
//     await db
//       .update(courseProgress)
//       .set({
//         completedModules: completedModulesCount,
//         progressPercentage,
//         updatedAt: now,
//       })
//       .where(
//         and(
//           eq(courseProgress.userId, userId),
//           eq(courseProgress.courseId, courseId)
//         )
//       );
//   } else {
//     // Create new course progress
//     await db.insert(courseProgress).values({
//       userId,
//       courseId,
//       completedModules: completedModulesCount,
//       progressPercentage,
//     });
//   }

//   return {
//     totalModules,
//     completedModules: completedModulesCount,
//     progressPercentage,
//     isCompleted: completedModulesCount === totalModules && totalModules > 0,
//   };
// };

// export const PATCH = async (
//   request: NextRequest,
//   context: { params: Promise<{ id: string; ids: string }> }
// ) => {
//   try {
//     const { ids: moduleId, id: courseId } = await context.params;
//     const requestBody = await request.json();

//     // Get user ID from session
//     const userId = await getUserIdFromSession();
//     if (!userId) {
//       return sendResponse(401, null, "Unauthorized. Please log in.");
//     }

//     // Only allow updating isCompleted field
//     const { isCompleted } = requestBody;
    
//     if (typeof isCompleted !== 'boolean') {
//       return sendResponse(400, null, "Invalid request. isCompleted must be a boolean.");
//     }

//     // Update the module
//     const updateData = {
//       isCompleted,
//       updatedAt: new Date(),
//     };

//     const updatedModule = await db
//       .update(courseModules)
//       .set(updateData)
//       .where(eq(courseModules.id, moduleId))
//       .returning();

//     if (!updatedModule.length) {
//       return sendResponse(404, null, "Module not found");
//     }

//     const moduleCourseId = updatedModule[0].courseId;

//     // Update course progress for this user
//     const progressData = await updateCourseProgress(userId, moduleCourseId);

//     // Check if all modules are completed
//     const allModules = await db
//       .select()
//       .from(courseModules)
//       .where(eq(courseModules.courseId, moduleCourseId));

//     const allModulesCompleted = allModules.every((module) => module.isCompleted);

//     // Update course completion status (only for this user's enrolled course)
//     if (allModulesCompleted) {
//       await db
//         .update(course)
//         .set({
//           isCourseCompleted: true,
//           updatedAt: new Date(),
//         })
//         .where(eq(course.id, moduleCourseId));
//     }

//     return sendResponse(
//       200,
//       {
//         module: updatedModule[0],
//         progress: progressData,
//         message: isCompleted 
//           ? "Module marked as complete!" 
//           : "Module marked as incomplete",
//       },
//       "Module updated successfully"
//     );
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "An error occurred";
//     return sendResponse(500, null, errorMessage);
//   }
// };

// // GET endpoint to retrieve user's progress for a course
// export const GET = async (
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) => {
//   try {
//     const { id: courseId } = await context.params;
    
//     const userId = await getUserIdFromSession();
//     if (!userId) {
//       return sendResponse(401, null, "Unauthorized. Please log in.");
//     }

//     // Get course progress
//     const progress = await db
//       .select()
//       .from(courseProgress)
//       .where(
//         and(
//           eq(courseProgress.userId, userId),
//           eq(courseProgress.courseId, courseId)
//         )
//       )
//       .limit(1);

//     // Get all modules for the course with completion status
//     const modules = await db
//       .select()
//       .from(courseModules)
//       .where(eq(courseModules.courseId, courseId));

//     return sendResponse(
//       200,
//       {
//         progress: progress[0] || null,
//         modules: modules,
//       },
//       "Progress retrieved successfully"
//     );
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "An error occurred";
//     return sendResponse(500, null, errorMessage);
//   }
// };




