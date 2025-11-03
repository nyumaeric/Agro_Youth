import axios from "axios";

export type CommentLikeFormData = {
  id: string;
  ids: string;
  commentId: string;
};

export type CommentLikeResponse = {
  status: number;
  message: string;
  data: {
    liked: boolean;
    likesCount?: number;
  };
};

export const createCommentLikes = async ({ 
  id, 
  ids, 
  commentId 
}: CommentLikeFormData): Promise<CommentLikeResponse> => {
  try {
    const response = await axios.post<CommentLikeResponse>(
      `/api/courses/${id}/posts/${ids}/comments/${commentId}/likes`
    );
    
    console.log('Comment Like API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Comment Like API Error:', error);
    
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