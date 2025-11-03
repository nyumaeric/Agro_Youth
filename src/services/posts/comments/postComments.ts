import axios from "axios";

export type CommentFormData = {
  id: string;
  content: string;
  isAnonymous: boolean;
  ids?: string;
};

export type CommentLikesFormData = {
  id: string;
  commentId: string;
};

export const createComment = async ({ id,ids,content, isAnonymous }: CommentFormData) => {
  try {
    const response = await axios.post(`/api/courses/${id}/posts/${ids}/comments`, { 
      content,
      isAnonymous
    });
    console.log('API Call Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};