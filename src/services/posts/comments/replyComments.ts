import axios from "axios";

export type CommentRepliesFormData = {
  id: string;
  ids: string;
  commentId: string;
  commentReplies: string;
  isAnonymous: boolean;
};

export const createCommentReplies = async ({
  id,
  ids,
  commentId,
  commentReplies,
  isAnonymous
}: CommentRepliesFormData) => {
  try {
    const response = await axios.post(
      `/api/courses/${id}/posts/${ids}/comments/${commentId}/replies`,
      { 
        commentReplies,
        isAnonymous 
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || {
        status: error.response?.status || 500,
        message: error.message || 'Network error occurred',
        data: { liked: false }
      };
    }
    throw {
      status: 500,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: { liked: false }
    };
  }
};