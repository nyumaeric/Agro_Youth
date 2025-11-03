"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { z } from "zod";
import showToast from "@/utils/showToast";
import { loginSchema } from "@/validator/loginSchema";

const initialData = {
  phoneNumber: "",
  password: "",
};

export const useLogin = () => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleLoginInputField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    // Clear error for this field
    if (errors[id]) {
      setErrors((prevErrors) => {
        const { [id]: _, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const handleSubmission = async () => {
    try {
      // Validate form data
      loginSchema.parse(formData);
      setIsLoading(true);
      setErrors({});

      // Attempt sign in with phone number
      const result = await signIn("credentials", {
        redirect: false,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      setIsLoading(false);

      if (result?.error) {
        // Handle errors
        setErrors({ general: result.error });
        
        if (result?.error === "AccessDenied") {
          showToast("Access denied. Please check your credentials.", "error");
        } else if (result?.error === "CredentialsSignin") {
          showToast("Invalid phone number or password", "error");
        } else {
          showToast("Invalid credentials", "error");
        }
      } else if (result?.ok) {
        // Success
        showToast("Successfully logged in", "success");
        
        // Reset form
        setFormData(initialData);
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh(); // Refresh to update session
        }, 500);
      }
    } catch (error) {
      setIsLoading(false);
      
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors = error.issues.reduce(
          (acc: Record<string, string>, curr) => {
            const field = Array.isArray(curr.path) && curr.path.length > 0 
              ? String(curr.path[0]) 
              : "general";
            acc[field] = curr.message;
            return acc;
          },
          {} as Record<string, string>
        );
        setErrors(fieldErrors);
        
        // Show first validation error
        const firstError = Object.values(fieldErrors)[0];
        if (firstError) {
          showToast(firstError, "error");
        }
      } else {
        // Handle unexpected errors
        const errorMessage = "An unexpected error occurred. Please try again.";
        setErrors({ general: errorMessage });
        showToast(errorMessage, "error");
      }
    }
  };

  return {
    formData,
    setFormData,
    handleSubmission,
    handleLoginInputField,
    errors,
    isLoading,
    session,
  };
};