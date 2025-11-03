import { createCommentReplies } from "@/services/posts/comments/replyComments";
import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

const initialData: {
  commentReplies: string;
} = {
  commentReplies: "",
};

export const useCreateRepliesComment = () => {
  const [formData, setformData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ ids, commentId }: {
      ids: string;
      commentId: string;
      // Fix: Pass all required properties for CommentRepliesFormData
    }) => {
      return createCommentReplies({
        id: '', // or provide a valid id if available
        isAnonymous: false, // or determine from context if appropriate
        ids,
        commentId,
        commentReplies: formData.commentReplies,
      });
    },
    onSuccess: (response, variables) => {
      showToast('Reply posted successfully!', 'success');
      setformData(initialData);
      setErrors({});
      
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['Posts']
      });
      queryClient.invalidateQueries({
        queryKey: ['Posts', variables.ids]
      });
      queryClient.invalidateQueries({
        queryKey: ['commentReplies', variables.ids, variables.commentId]
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to post reply. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  const handleSubmit = async (postId: string, commentId: string) => {
    if (!formData.commentReplies?.trim()) {
      setErrors({ commentReplies: 'Reply content is required' });
      return;
    }

    try {
      await mutate({
        ids: postId,
        commentId: commentId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = (error as z.ZodError<any>).issues.reduce(
          (acc: Record<string, string>, curr: any) => {
            acc[curr.path[0] as string] = curr.message;
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
    setformData({ ...formData, [id]: value });
    
    // Clear error for this field if it exists
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
    setformData,
    isPending,
    errors,
    setErrors,
    handleSubmit,
    handleInputField
  };
};