import { useMutation, useQueryClient } from '@tanstack/react-query';
import showToast from '@/utils/showToast';
import { createCommentLikes } from '@/services/posts/comments/postCommentsLikes';


interface CommentMutationParams {
  commentId: string;
  courseId: string;
  postId: string;
}

export const useCommentLikes = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ commentId, courseId, postId }: CommentMutationParams) => {
      return createCommentLikes({
        id: courseId,
        ids: postId,
        commentId
      });
    },

    onMutate: async ({ commentId, courseId, postId }) => {
      await queryClient.cancelQueries({
        queryKey: ["Posts", courseId, postId]
      });

      const previousData = queryClient.getQueryData(["Posts", courseId, postId]);

      queryClient.setQueryData(["Posts", courseId, postId], (old: any) => {
        if (!old?.data?.posts) return old;

        return {
          ...old,
          data: {
            ...old.data,
            posts: old.data.posts.map((post: any) => ({
              ...post,
              comments: post.comments?.map((comment: any) => {
                if (comment.id === commentId) {
                  const currentLiked = comment.isLiked || false;
                  const currentCount = comment.likesCount || 0;
                  
                  return {
                    ...comment,
                    isLiked: !currentLiked,
                    likesCount: currentLiked ? currentCount - 1 : currentCount + 1
                  };
                }
                return comment;
              }) || []
            }))
          }
        };
      });

      return { previousData, commentId, courseId, postId };
    },

    onSuccess: (response, variables) => {
      queryClient.setQueryData(["Posts", variables.courseId, variables.postId], (old: any) => {
        if (!old?.data?.posts) return old;

        return {
          ...old,
          data: {
            ...old.data,
            posts: old.data.posts.map((post: any) => ({
              ...post,
              comments: post.comments?.map((comment: any) => {
                if (comment.id === variables.commentId) {
                  return {
                    ...comment,
                    isLiked: response.data.liked,

                  };
                }
                return comment;
              }) || []
            }))
          }
        };
      });

      queryClient.invalidateQueries({
        queryKey: ["Posts", variables.courseId, variables.postId]
      });
      queryClient.invalidateQueries({ 
        queryKey: ['Posts'] 
    });
    },

    onError: (error: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["Posts", context.courseId, context.postId], 
          context.previousData
        );
      }

      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to update like. Please try again.';
      
      showToast(errorMessage, 'error');
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["Posts", variables.courseId, variables.postId]
      });
    },
  });

  const toggleCommentLike = (commentId: string, courseId: string, postId: string) => {
    mutate({ commentId, courseId, postId });
  };
  

  return {
    toggleCommentLike,
    isPending
  };
};