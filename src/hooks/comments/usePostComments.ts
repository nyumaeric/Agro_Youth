import { createComment } from '@/services/posts/comments/postComments';
import showToast from '@/utils/showToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { z } from 'zod';

interface CreatePostsCommentInterface {
  content: string;
}

interface CommentMutationParams {
  data: CreatePostsCommentInterface;
  id: string;
}

const initialData: CreatePostsCommentInterface = {
  content: "",
};

export const useCreateComment = (id: string) => {
  const [formData, setFormData] = useState<CreatePostsCommentInterface>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data, id: mutationId }: CommentMutationParams) => {
      return createComment({
        id: mutationId,
        content: data.content,
        isAnonymous: false,
      });
    },
    onSuccess: (response, variables) => {
      showToast('Comment posted successfully!', 'success');
      setFormData(initialData);
      setErrors({});
      
      queryClient.invalidateQueries({
        queryKey: ["Posts", variables.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['Posts']
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to post comment. Please try again.';
      showToast(errorMessage, 'error');
      console.error('Comment submission error:', error);
    },
  });

  const handleSubmit = async (postId: string) => {
    try {
      await mutate({
        id: postId,
        data: formData
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.reduce(
          (acc: Record<string, string>, curr) => {
            if (curr.path && curr.path.length > 0) {
              acc[String(curr.path[0])] = curr.message;
            }
            return acc;
          },
          {} as Record<string, string>
        );
        setErrors(fieldErrors);
      }
    }
  };

  const handleInputField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { id: string; value: any } }
  ) => {
    const { id, value } = e.target;
    
    setFormData({ ...formData, [id]: value });
    
    if (errors[id]) {
      setErrors((prevErrors) => {
        const { [id]: _, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  return {
    mutate,
    formData,
    setFormData,
    isPending,
    errors,
    setErrors,
    handleSubmit,
    handleInputField
  };
};