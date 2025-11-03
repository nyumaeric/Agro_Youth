import axios from "axios";

export type PostLikeFormData = {
  id: string;
  ids: string;
};

export type PostLikeResponse = {
  status: number;
  message: string;
  data: {
    liked: boolean;
    likesCount?: number;
  };
};

export const createPostLikes = async ({ 
  id, 
  ids, 
}: PostLikeFormData): Promise<PostLikeResponse> => {
  try {
    const response = await axios.post<PostLikeResponse>(
      `/api/courses/${id}/posts/${ids}/likes`
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