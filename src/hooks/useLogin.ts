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
    
    if (errors[id]) {
      setErrors((prevErrors) => {
        const { [id]: _, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const handleSubmission = async () => {
    try {
      loginSchema.parse(formData);
      setIsLoading(true);
      setErrors({});

      const result = await signIn("credentials", {
        redirect: false,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      setIsLoading(false);

      if (result?.error) {
        setErrors({ general: result.error });
        
        if (result?.error === "AccessDenied") {
          showToast("Access denied. Please check your credentials.", "error");
        } else if (result?.error === "CredentialsSignin") {
          showToast("Invalid phone number or password", "error");
        } else {
          showToast("Invalid credentials", "error");
        }
      } else if (result?.ok) {
        showToast("Successfully logged in", "success");
        
        setFormData(initialData);
        
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh(); 
        }, 500);
      }
    } catch (error) {
      setIsLoading(false);
      
      if (error instanceof z.ZodError) {
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
        
        const firstError = Object.values(fieldErrors)[0];
        if (firstError) {
          showToast(firstError, "error");
        }
      } else {
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