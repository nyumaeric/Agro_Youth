import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { NextRequest } from "next/server";
import {
  Post,
  users,
  Comment,
  CommentLikes,
  CommentReplies,
  PostLikes,
} from "@/server/db/schema";
import db from "@/server/db";
import cloudinary from "@/utils/cloudinary";
import { desc, eq, and, sql } from "drizzle-orm";
import { sendResponse } from "@/utils/response";

const validContentTypes = ["text", "image", "video", "audio", "link"];




export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const { id } = await params;
    const courseId = id;

    if (!courseId) {
      return sendResponse(400, null, "Group ID is required");
    }


    const formData = await req.formData();
    const title = formData.get("title") as string;
    const contentTypeInput = formData.get("contentType") as string;
    const textContent = formData.get("textContent") as string | null;
    const mediaAlt = formData.get("mediaAlt") as string | null;
    const linkUrl = formData.get("linkUrl") as string | null;
    const linkDescription = formData.get("linkDescription") as string | null;
    const isAnonymous = formData.get("isAnonymous") as unknown as boolean;

    if (!title || title.trim() === "") {
      return sendResponse(400, null, "Title is required");
    }

    if (!contentTypeInput) {
      return sendResponse(400, null, "Content type is required");
    }

    const normalizedContentType = contentTypeInput.toString().trim().toLowerCase();
    if (!validContentTypes.includes(normalizedContentType)) {
      return sendResponse(400, null, `Invalid content type. Must be one of: ${validContentTypes.join(", ")}`);
    }

    const contentType = normalizedContentType as "text" | "image" | "video" | "audio" | "link";


    let mediaUrl = null;
    if (["image", "video", "audio"].includes(contentType)) {
      const mediaFile = formData.get("media") as File;
      if (!mediaFile) {
        return sendResponse(400, null, `${contentType} file is required`);
      }

      const bytes = await mediaFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const resourceType =
        contentType === "image"
          ? "image"
          : contentType === "video"
          ? "video"
          : "auto";

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: `posts/${contentType}s`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        const { Readable } = require("stream");
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        stream.pipe(uploadStream);
      });

      mediaUrl = uploadResult.secure_url;
    }

    let linkPreviewImage = null;
    if (contentType === "link") {
      const previewImageFile = formData.get("linkPreviewImage") as File;
      if (previewImageFile) {
        const bytes = await previewImageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "posts/link-previews",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          const { Readable } = require("stream");
          const stream = new Readable();
          stream.push(buffer);
          stream.push(null);
          stream.pipe(uploadStream);
        });

        linkPreviewImage = uploadResult.secure_url;
      }
    }

    const newPost = await db
      .insert(Post)
      .values({
        userId,
        courseId,
        title,
        contentType,
        textContent,
        mediaUrl,
        mediaAlt,
        linkUrl,
        isAnonymous,
        linkDescription,
        linkPreviewImage,
      })
      .returning();


    return sendResponse(200, {
      post: newPost[0],

    }, "Post created successfully");

  } catch (error) {
    const err =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return sendResponse(500, null, err);
  }
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }
    const contextId = (await params).id;

    const posts = await db
      .select({
        post: Post,
        author: {
          id: users.id,
          name: users.fullName,
          fullName: users.fullName,
          image: users.profilePicUrl,
          anonymity_name: users.anonymousName,
          anonymousName: users.anonymousName, 
        },
      })
      .from(Post)
      .leftJoin(users, eq(Post.userId, users.id))
      .where(eq(Post.courseId, contextId))
      .orderBy(desc(Post.createdAt));

    const postsWithDetails = await Promise.all(
      posts.map(async ({ post, author }) => {
        const comments = await db
          .select({
            comment: Comment,
            author: {
              id: users.id,
              name: users.fullName,
              image: users.profilePicUrl,
              anonymousName: users.anonymousName,
              anonymity_name: users.anonymousName, 
            },
            likesCount: sql<number>`count(distinct ${CommentLikes.id})`,
            isAnonymous: Comment.isAnonymous
          })
          .from(Comment)
          .leftJoin(users, eq(Comment.userId, users.id))
          .leftJoin(CommentLikes, eq(CommentLikes.comment_id, Comment.id))
          .where(eq(Comment.postId, post.id))
          .groupBy(Comment.id, users.id)
          .orderBy(desc(Comment.createdAt));
        
        const commentsWithReplies = await Promise.all(
          comments.map(async (comment) => {
            const replies = await db
              .select({
                reply: CommentReplies,
                author: {
                  id: users.id,
                  name: users.fullName,
                  image: users.profilePicUrl,
                  anonymousName: users.anonymousName,
                },
              })
              .from(CommentReplies)
              .leftJoin(users, eq(CommentReplies.user_id, users.id))
              .where(eq(CommentReplies.comment_id, comment.comment.id))
              .orderBy(desc(CommentReplies.createdAt));

            const userCommentLike = await db
              .select()
              .from(CommentLikes)
              .where(
                and(
                  eq(CommentLikes.comment_id, comment.comment.id),
                  eq(CommentLikes.user_id, userId)
                )
              )
              .limit(1);

            return {
              ...comment,
              comment: {
                ...comment.comment,
                isLiked: userCommentLike.length > 0,
                isAnonymous: comment.isAnonymous || comment.comment.isAnonymous
              },
              replies: replies.map((r) => ({
                ...r.reply,
                author: r.author,
              })),
            };
          })
        );

        const postLikesResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(PostLikes)
          .where(eq(PostLikes.post_id, post.id));

        const userPostLike = await db
          .select()
          .from(PostLikes)
          .where(
            and(
              eq(PostLikes.post_id, post.id),
              eq(PostLikes.user_id, userId)
            )
          )
          .limit(1);

        return {
          ...post,
          author: {
            ...author,
            fullName: author?.name, 
          },
          comments: commentsWithReplies.map((c) => ({
            ...c.comment,
            author: {
              ...c.author,
              anonymousName: c.author?.anonymousName,
              anonymity_name: c.author?.anonymousName,
            },
            likesCount: Number(c.likesCount),
            likes: Number(c.likesCount),
            replies: c.replies,
            isAnonymous: c.comment.isAnonymous || c.isAnonymous
          })),
          isAnonymous: post.isAnonymous || false,
          likes: Number(postLikesResult[0]?.count || 0),
          likesCount: Number(postLikesResult[0]?.count || 0),
          isLiked: userPostLike.length > 0,
          views: 0,
          shares: 0,
        };
      })
    );

    return sendResponse(200, postsWithDetails, "Posts retrieved successfully");
  } catch (error) {
    const err =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return sendResponse(500, null, err);
  }
};