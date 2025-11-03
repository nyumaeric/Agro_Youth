import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Post {
  id: string;
  userId: string;
  coursesId: string;
  title: string;
  contentType: "text" | "image" | "video" | "audio" | "link";
  textContent?: string;
  mediaUrl?: string;
  mediaAlt?: string;
  linkUrl?: string;
  linkDescription?: string;
  linkPreviewImage?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
}

export const useGetPosts = (coursesId: string) => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["Posts", coursesId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${coursesId}/posts`);
      return response.data;
    },
  });

  return {
    posts: data?.data || [],
    isPending,
    error,
    refetch
  };
};
export const useGetMostPopularPosts = () => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["PopularPosts"],
    queryFn: async () => {
      const response = await axios.get(`/api/popularposts`);
      return response.data;
    },
  });

  return {
    popularPosts: data?.data || [],
    isPending,
    error,
    refetch
  };
};
