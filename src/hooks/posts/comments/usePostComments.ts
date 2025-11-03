import { useMutation, useQueryClient } from '@tanstack/react-query';
import showToast from '@/utils/showToast';
import { useState } from 'react';
import { z } from 'zod'; 
import { group } from 'console';
import { createComment } from '@/services/posts/comments/postComments';

interface CreatePostsCommentInterface {
    content: string;
    isAnonymous: boolean
}

interface CommentMutationParams {
    data: CreatePostsCommentInterface;
    id: string;
    ids: string;
}

const initialData: CreatePostsCommentInterface = {
    content: "",
    isAnonymous: false
};

export const useCreateComment = (ids: string) => {
    const [formData, setFormData] = useState<CreatePostsCommentInterface>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const { mutate , isPending} = useMutation({
        mutationFn: ({ data, id}: CommentMutationParams) => {
            return createComment({
                ids,
                id,
                content: data.content,
                isAnonymous: data.isAnonymous 
            });
        },
        onSuccess: (response, variables) => {
            showToast('Comment posted successfully!', 'success');
            
            setFormData(initialData);
            setErrors({});
            
            queryClient.invalidateQueries({
                queryKey: ["Posts", variables.id]
        })
            queryClient.invalidateQueries({ 
                queryKey: ["Posts", variables.id, variables.ids] 
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

    const handleSubmit = async (id: string, ids: string) => {
        try {
            await mutate({
                ids,
                id,
                data: formData
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = (error as z.ZodError).issues.reduce(
                    (acc: Record<string, string>, curr) => {
                        if (curr.path && curr.path.length > 0 && typeof curr.path[0] === 'string') {
                            acc[curr.path[0]] = curr.message;
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
        
        const processedValue = id === 'isAnonymous' ? Boolean(value) : value;
        
        setFormData({ ...formData, [id]: processedValue });
        
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