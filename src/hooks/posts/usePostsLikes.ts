import { useMutation, useQueryClient } from '@tanstack/react-query';
import showToast from '@/utils/showToast';
import { createPostLikes } from '@/services/posts/postLikes';

interface PostMutationParams {
  groupId: string;
  postId: string;
}

export const usePostLikes = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ groupId, postId }: PostMutationParams) => {
      return createPostLikes({
        id: groupId,
        ids: postId,
      });
    },

    onMutate: async ({ groupId, postId }) => {
      await queryClient.cancelQueries({
        queryKey: ["Posts", groupId]
      });

      const previousData = queryClient.getQueryData(["Posts", groupId]);

      queryClient.setQueryData(["Posts", groupId], (old: any) => {
        if (!old?.data?.posts) return old;

        return {
          ...old,
          data: {
            ...old.data,
            posts: old.data.posts.map((post: any) => {
              if (post.id === postId) {
                const currentLiked = post.isLiked || false;
                const currentCount = post.likes || 0;
                return {
                  ...post,
                  isLiked: !currentLiked,
                  likes: currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1
                };
              }
              return post;
            })
          }
        };
      });

      return { previousData, groupId, postId };
    },

    onSuccess: (response, variables, context) => {
      queryClient.setQueryData(["Posts", variables.groupId], (old: any) => {
        if (!old?.data?.posts) return old;

        return {
          ...old,
          data: {
            ...old.data,
            posts: old.data.posts.map((post: any) => {
              if (post.id === variables.postId) {
                return {
                  ...post,
                  isLiked: response.data.liked,
                  likes: response.data.likesCount ?? post.likes
                };
              }
              return post;
            })
          }
        };
      });

      const message = response.data.liked ? 'Post liked!' : 'Post unliked!';
      showToast(message, 'success');
      queryClient.invalidateQueries({ queryKey: ["Posts"] });

    },

    onError: (error: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["Posts", context.groupId],
          context.previousData
        );
      }

      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to update post like. Please try again.';
      
      showToast(errorMessage, 'error');
    },

  });

  const togglePostLike = (groupId: string, postId: string) => {
    mutate({ groupId, postId });
  };

  return {
    togglePostLike,
    isPending
  };
};