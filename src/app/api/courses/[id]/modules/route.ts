import db from "@/server/db";
import { course, courseModules } from "@/server/db/schema";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { courseModuleValidation } from "@/validator/courseModule";
import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const POST = async (req:NextRequest, {params}: {params: Promise<{id: string}>}) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        body = {};
      }


       const { id } = await params;

       const [existingCourse] = await db.select().from(course).where(eq(course.id, id))

       if(!existingCourse){
        return sendResponse(400, null, "Course not found")
       }
       const userId = await getUserIdFromSession();
       const [isAdmin] = await Promise.all([
         checkIfUserIsAdmin(),
       ]);
 
       const isAuthorized = isAdmin
   
       if (!isAuthorized || !userId) {
         return sendResponse(401, null, "Unauthorized");
       }



      const data = courseModuleValidation.safeParse(body);
      if (!data.success) {
        const errors = Object.fromEntries(
          Object.entries(data.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
        );
        return sendResponse(400, errors, "Validation failed");
      }
  
      const { title, content,isCompleted, durationTime } = data.data;

      console.log("title", title, "content", content, "isCompleted", isCompleted, "durationTime", durationTime)
      if (!title || !content   || !durationTime) {
        return sendResponse(400, null, "Missing required fields");
      }
      await db.insert(courseModules).values({
        courseId: id,
        title,
        content,
        isCompleted,
        durationTime,
      });


      return sendResponse(200, null, "Module created successfully");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";

      return sendResponse(500, null, errorMessage);
    }
};

export const GET = async(req:NextRequest, {params}: {params: Promise<{id: string}>}) => {
    try {
        const { id } = await params;
        const courseModule = await db.select().from(courseModules).where(eq(courseModules.courseId, id)).orderBy(desc(courseModules.createdAt))
        return sendResponse(200, courseModule, "Module created Successfully")
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";

        return sendResponse(500, null, errorMessage);
    }
}