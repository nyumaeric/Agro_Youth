import { NextRequest, NextResponse } from "next/server";
import db from "@/server/db";
import { CommentLikes } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { HttpStatusCode } from "axios";
import { and, eq, count } from "drizzle-orm";
import { sendResponse } from "@/utils/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, ids: string, commentsId: string }> }
) {
  try {
    const { commentsId, id, ids } = await params;
    
    if (!id || !ids) {
      return sendResponse(401, null, "Course id or post id is needed");
    }

    const commentId = commentsId;
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json(
        { status: 401, message: "Unauthorized", data: null },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const existingLike = await db
      .select()
      .from(CommentLikes)
      .where(
        and(
          eq(CommentLikes.comment_id, commentId as string),
          eq(CommentLikes.user_id, userId as string)
        )
      );

    let liked = false;

    if (existingLike.length > 0) {
      await db
        .delete(CommentLikes)
        .where(
          and(
            eq(CommentLikes.comment_id, commentId as string),
            eq(CommentLikes.user_id, userId as string)
          )
        );
      liked = false;
    } else {
      await db
        .insert(CommentLikes)
        .values({
          comment_id: commentId as string,
          user_id: userId as string
        });
      liked = true;
    }

    const likesCountResult = await db
      .select({ count: count() })
      .from(CommentLikes)
      .where(eq(CommentLikes.comment_id, commentId as string));

    const likesCount = likesCountResult[0]?.count || 0;

    return NextResponse.json({
      status: 200,
      message: liked ? "Comment liked successfully" : "Comment unliked successfully",
      data: { 
        liked,
        likesCount
      }
    });

  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error',
        status: 500,
        data: null,
      },
      { status: 500 }
    );
  }
}