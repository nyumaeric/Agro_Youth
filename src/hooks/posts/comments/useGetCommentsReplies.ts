import { getCommentReplies } from "@/services/posts/comments/getCommentReplies";
import { useQuery } from "@tanstack/react-query";

export const useGetCommentReplies = (
  courseId: string,
  postId: string,
  commentId: string,
  options?: {
    page?: number;
    limit?: number;
    enabled?: boolean;
  }
) => {
  const { page = 1, limit = 10, enabled = true } = options || {};

  return useQuery({
    queryKey: ['commentReplies', courseId, postId, commentId, page, limit],
    queryFn: () => getCommentReplies({
      courseId,
      postId,
      commentId,
      page,
      limit
    }),
    enabled: enabled && !!courseId && !!postId && !!commentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};