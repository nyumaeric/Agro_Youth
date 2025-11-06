import db from "@/server/db";
import { course, courseModules } from "@/server/db/schema";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { getPaginationParams } from "@/utils/pagination";
import { sendResponse } from "@/utils/response";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

type CountResult = { count: number };
 
export const GET = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();
    const admin = await checkIfUserIsAdmin();
    if(!userId){
        sendResponse(400, null, "UnAuthorized")
    }
    if(!admin){
        sendResponse(400, null, "UnAuthorized")
    }
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
    .where(eq(course.createdId, userId ?? ''))
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


