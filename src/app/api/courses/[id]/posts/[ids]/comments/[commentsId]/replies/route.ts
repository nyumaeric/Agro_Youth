import { NextRequest, NextResponse } from 'next/server';
import { and, count, desc, eq } from 'drizzle-orm';
import { getUserIdFromSession } from '@/utils/getUserIdFromSession';
import { Comment, Post, CommentReplies, users } from '@/server/db/schema';
import db from '@/server/db';

// Function to generate anonymous name based on user's real name
const generateAnonymousName = (fullName: string): string => {
  if (!fullName) return 'Anonymous User';
  
  const names = fullName.trim().split(' ');
  if (names.length === 1) {
    return `${names[0].charAt(0)}***`;
  }
  
  const firstName = names[0];
  const lastName = names[names.length - 1];
  return `${firstName.charAt(0)}*** ${lastName.charAt(0)}***`;
};

type ReplyInsert = {
  comment_id: string;
  user_id: string;
  commentReplies: string;
  isAnonymous: boolean;
};

export async function POST(
  req: NextRequest,
  segmentedData: { params: Promise<{id: string; ids: string; commentsId: string}>}
) {
  try {
    const params = await segmentedData.params;
    const { id, ids, commentsId } = params;

    if (!id || !ids || !commentsId) {
      return NextResponse.json(
        { 
          status: 400, 
          message: "Missing required parameters", 
          data: null 
        },
        { status: 400 }
      );
    }

    const user_id = await getUserIdFromSession();
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { status: 401, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const { commentReplies, isAnonymous = false } = await req.json();

    const post = await db
      .select()
      .from(Post)
      .where(eq(Post.id, ids));

    if (post.length === 0) {
      return NextResponse.json(
        { 
          status: 404, 
          message: `Post not found with id: ${ids}`, 
          data: null 
        },
        { status: 404 }
      );
    }

    const comment = await db
      .select()
      .from(Comment)
      .where(and(eq(Comment.id, commentsId), eq(Comment.postId, ids)));

    if (!comment || comment.length === 0) {
      return NextResponse.json(
        { 
          status: 404, 
          message: `Comment not found with id: ${commentsId} for post: ${ids}`, 
          data: null 
        },
        { status: 404 }
      );
    }

    if (!commentReplies || typeof commentReplies !== 'string' || commentReplies.trim().length === 0) {
      return NextResponse.json(
        { status: 400, message: "Reply content is required", data: null },
        { status: 400 }
      );
    }

    const insertValues: ReplyInsert = {
      comment_id: commentsId,
      user_id,
      commentReplies: commentReplies.trim(),
      isAnonymous: Boolean(isAnonymous),
    };

    const newReply = await db
      .insert(CommentReplies)
      .values(insertValues)
      .returning();

    const userDetails = await db
      .select({
        id: users.id,
        name: users.fullName,
        image: users.profilePicUrl,
      })
      .from(users)
      .where(eq(users.id, user_id))
      .limit(1);

    const user = userDetails[0];
    
    let responseData: any = {
      ...newReply[0],
      likes: 0,
      likesCount: 0,
      isLiked: false
    };

    if (user) {
      if (isAnonymous) {
        responseData.author = {
          id: user.id,
          name: user.name || 'Anonymous User',
          image: user.image,
          anonymousName: generateAnonymousName(user.name || ''),
          anonymity_name: generateAnonymousName(user.name || '')
        };
      } else {
        responseData.author = {
          id: user.id,
          name: user.name || 'Anonymous User',
          image: user.image
        };
      }
    } else {
      responseData.author = {
        id: null,
        name: 'Anonymous User',
        username: null,
        image: null,
        gender: null
      };
    }

    return NextResponse.json({
      status: 200,
      message: "Reply added successfully",
      data: responseData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error posting reply: ${error.message}` 
      : 'Internal server error';
    
    return NextResponse.json(
      { 
        status: 500, 
        message: errorMessage,
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  segmentedData: { params: Promise<{id: string; ids: string; commentsId: string}> }
) {
  try {
    const params = await segmentedData.params;
    const { id, ids, commentsId } = params;
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!id || !ids || !commentsId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing required parameters",
          data: null
        },
        { status: 400 }
      );
    }

    const user_id = await getUserIdFromSession();
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { status: 401, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const post = await db
      .select()
      .from(Post)
      .where(eq(Post.id, ids))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        {
          status: 404,
          message: `Post not found with id: ${ids}`,
          data: null
        },
        { status: 404 }
      );
    }

    const comment = await db
      .select()
      .from(Comment)
      .where(and(eq(Comment.id, commentsId), eq(Comment.postId, ids)))
      .limit(1);

    if (comment.length === 0) {
      return NextResponse.json(
        {
          status: 404,
          message: `Comment not found with id: ${commentsId} for post: ${ids}`,
          data: null
        },
        { status: 404 }
      );
    }

    const totalCountResult = await db
      .select({ count: count() })
      .from(CommentReplies)
      .where(eq(CommentReplies.comment_id, commentsId));

    const totalCount = totalCountResult[0]?.count || 0;

    const replies = await db
      .select({
        id: CommentReplies.id,
        comment_id: CommentReplies.comment_id,
        user_id: CommentReplies.user_id,
        commentReplies: CommentReplies.commentReplies,
        isAnonymous: CommentReplies.isAnonymous,
        createdAt: CommentReplies.createdAt,
        updatedAt: CommentReplies.updatedAt,
        author: {
          id: users.id,
          name: users.fullName,
          image: users.profilePicUrl,
        }
      })
      .from(CommentReplies)
      .leftJoin(users, eq(CommentReplies.user_id, users.id))
      .where(eq(CommentReplies.comment_id, commentsId))
      .orderBy(desc(CommentReplies.createdAt))
      .limit(limit)
      .offset(offset);

    const hasMore = offset + replies.length < totalCount;

    // Process replies to handle anonymous display
    const processedReplies = replies.map(reply => {
      let authorInfo = reply.author
        ? {
            ...reply.author,
            name: reply.author.name || 'Anonymous User'
          }
        : {
            id: null,
            name: 'Anonymous User',
            username: null,
            image: null,
            gender: null
          };

      if (reply.isAnonymous && reply.author?.name) {
        authorInfo = {
          ...authorInfo,
          name: generateAnonymousName(reply.author.name)
        };
      }

      return {
        ...reply,
        author: authorInfo,
        likes: 0, 
        likesCount: 0,
        isLiked: false
      };
    });

    return NextResponse.json({
      status: 200,
      message: "Replies fetched successfully",
      data: {
        replies: processedReplies,
        totalCount,
        hasMore,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error
      ? `Error fetching replies: ${error.message}`
      : 'Internal server error';
    
    return NextResponse.json(
      {
        status: 500,
        message: errorMessage,
        data: null
      },
      { status: 500 }
    );
  }
}