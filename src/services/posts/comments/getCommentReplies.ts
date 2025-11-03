import axios from "axios";

export interface CommentReply {
  id: string;
  comment_id: string;
  user_id: string;
  commentReplies: string;
  isAnonymous: boolean; 
  createdAt: string;
  updatedAt: string;
  likes?: number;
  likesCount?: number;
  isLiked?: boolean;
  author: {
    id: string | null;
    fullName: string;
    image?: string | null;
    anonymousName?: string; 
    anonymity_name?: string; 
  };
}

export type GetCommentRepliesResponse = {
  status: number;
  message: string;
  data: {
    replies: CommentReply[];
    totalCount: number;
    hasMore: boolean;
  };
};

export const getCommentReplies = async ({
  courseId,
  postId,
  commentId,
  page = 1,
  limit = 10
}: {
  courseId: string;
  postId: string;
  commentId: string;
  page?: number;
  limit?: number;
}): Promise<GetCommentRepliesResponse> => {
  try {
    const response = await axios.get(
      `/api/courses/${courseId}/posts/${postId}/comments/${commentId}/replies`,
      {
        params: { page, limit }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || {
        status: error.response?.status || 500,
        message: error.message || 'Network error occurred',
        data: { replies: [], totalCount: 0, hasMore: false }
      };
    }
    throw {
      status: 500,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: { replies: [], totalCount: 0, hasMore: false }
    };
  }
};