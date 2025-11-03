import { Comment } from "@/server/db/schema";
import db from "@/server/db";
import { NextRequest } from "next/server";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";

export async function POST(
    req: NextRequest,
    {params}: {params: Promise<{id: string, ids: string}>}
){
    try {
        const userId = await getUserIdFromSession();
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const {ids} = await params;
        if (!ids) {
            return sendResponse(400, null, "Post ID is required");
        }

        const postId = ids
        if (!postId) {
            return new Response(JSON.stringify({ error: "Post ID is required" }), { status: 400 });
        }
        const { content, isAnonymous } = await req.json();

        if (!content) {
            return new Response(JSON.stringify({ error: "Content is required" }), { status: 400 });
        }
        await db.insert(Comment).values({
            content,
            postId,
            userId,
            isAnonymous
        }).returning();

        return sendResponse(200, null, "Comment created successfully");

    } catch (error) {
        const err = error instanceof Error ? error.message : "Unexpected error occurred";
        return sendResponse(500, null, err);
    }
}

export const GET = async() => {
    try {
        const userId = await getUserIdFromSession();
        if (!userId) {
            return sendResponse(401, null, "Unauthorized");
        }
        const allComments = await db.select().from(Comment);
        if (!allComments) {
            return new Response(JSON.stringify({ error: "No comments found" }), { status: 404 });
        }
        return sendResponse(200, allComments, "Comments fetched successfully");

    } catch (error) {
        const err = error instanceof Error ? error.message : "Unexpected error occurred";
        return sendResponse(500, null, err);
    }
}