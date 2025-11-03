import axios from "axios";

export const createPostsService = async({ data, courseId } : { data: FormData, courseId: string }) => {
  try {
    const response = await axios.post(
      `/api/courses/${courseId}/posts`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      
      throw new Error(errorData.message || "API request failed");
    }
    
    const err = error instanceof Error ? error.message : "Unexpected error occurred";
    throw new Error(err);
  }
};