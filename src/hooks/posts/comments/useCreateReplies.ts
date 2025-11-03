import { createCommentReplies } from "@/services/posts/comments/replyComments";
import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react"
import { z } from "zod";

const initialData: {
  commentReplies: string;
  isAnonymous: boolean;
} = {
  commentReplies: "",
  isAnonymous: false
}

export const useCreateRepliesComment = (id: string) => {
  const [formData, setformData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ ids, commentId }: {
      ids: string;
      commentId: string
    }) => {
      return createCommentReplies({
        id,
        ids,
        commentId,
        commentReplies: formData.commentReplies,
        isAnonymous: formData.isAnonymous
      })
    },
    onSuccess: (response, variables) => {
      showToast('Reply posted successfully!', 'success');
      setformData(initialData);
      setErrors({});
      queryClient.invalidateQueries({
        queryKey: ['Posts']
      });
      queryClient.invalidateQueries({
        queryKey: ['commentReplies', id, variables.ids, variables.commentId]
      });

    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to post reply. Please try again.';
      showToast(errorMessage, 'error');
    },
  })

  const handleSubmit = async (id: string, ids: string, commentsId: string) => {
    if (!formData.commentReplies?.trim()) {
      setErrors({ commentReplies: 'Reply content is required' });
      return;
    }

    try {
      console.log('HandleSubmit called with:', { 
        id, 
        ids, 
        commentsId, 
        content: formData.commentReplies,
        isAnonymous: formData.isAnonymous 
      });
      await mutate({
        ids,
        commentId: commentsId
      });
    } catch (error) {
      console.error('HandleSubmit error:', error);
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.reduce(
          (acc: Record<string, string>, curr) => {
            const key = Array.isArray(curr.path) ? curr.path[0] : undefined;
            if (typeof key === 'string') {
              acc[key] = curr.message;
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
    console.log('Input field changed:', { id, value });
    
    setformData({ ...formData, [id]: value });
    
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
}