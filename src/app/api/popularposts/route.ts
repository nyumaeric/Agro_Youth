import db from "@/server/db";
import { Post, PostLikes } from "@/server/db/schema";
import { sendResponse } from "@/utils/response";
import { desc, eq, sql } from "drizzle-orm";


export const GET = async () => {
    try {
        const result = await db
        .select({
        id: Post.id,
        title: Post.title,
        content: Post.textContent,
        likeCount: sql<number>`COUNT(${PostLikes.id})`.as("like_count"),
        })
        .from(Post)
        .leftJoin(PostLikes, eq(PostLikes.post_id, Post.id))
        .groupBy(Post.id)
        .orderBy(desc(sql`COUNT(${PostLikes.id})`))
        .limit(3);

        return sendResponse(200, result, "popular posts")
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return sendResponse(500, null, errorMessage);
    }
};