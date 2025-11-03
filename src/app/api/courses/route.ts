
import db from "@/server/db";
import { course, courseModules } from "@/server/db/schema";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { getPaginationParams } from "@/utils/pagination";
import { sendResponse } from "@/utils/response";
import { courseValidation } from "@/validator/coursesSchema";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        body = {};
      }

       const userId = await getUserIdFromSession();
       const [isAdmin] = await Promise.all([
         checkIfUserIsAdmin(),
       ]);
 
       const isAuthorized = isAdmin
   
       if (!isAuthorized || !userId) {
         return sendResponse(401, null, "Unauthorized");
       }



      const data = courseValidation.safeParse(body);
      if (!data.success) {
        const errors = Object.fromEntries(
          Object.entries(data.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
        );
        return NextResponse.json(
          { status: "Error!", errors, message: "Validation failed" }, 
          { status: 400 }
        );
      }
  
      const { title, description, timeToComplete,level,category, language } = data.data;
      if (!title || !description || !timeToComplete || !level || !category || !language) {
        return sendResponse(400, null, "Missing required fields");
      }
      await db.insert(course).values({
        createdId: userId,
        title,
        description,
        level,
        category,
        language,
        timeToComplete: timeToComplete
      });

      // const coursesToInsert = Array.from({ length: 40 }, (_, index) => ({
      //   createdId: userId,
      //   title: `${title} - Part ${index + 1}`,
      //   description: `${description} (Copy ${index + 1})`,
      //   level,
      //   category,
      //   language,
      //   timeToComplete
      // }));
      // await db.insert(course).values(coursesToInsert);
      return sendResponse(200, null, "Course created successfully");

    } catch (error) {
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