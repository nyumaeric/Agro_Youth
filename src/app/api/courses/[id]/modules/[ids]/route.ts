import db from "@/server/db";
import { courseModules } from "@/server/db/schema";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";

export const GET = async (
  request: Request,
  { params }: { params: { id: string; ids: string } }
) => {
  try {
    const { ids } = await params;
    
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
  request: Request,
  { params }: { params: { id: string; ids: string } }
) => {
  try {
    const { ids } = await params;
    const requestBody = await request.json();
    const updateData = {
        ...requestBody,
        updatedAt: new Date(),
    };
    await db.update(courseModules).set(updateData).where(eq(courseModules.id, ids)).returning();
    return sendResponse(200, null, 'Learning resource updated successfully');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";

    return sendResponse(500, null, errorMessage);
  }
};