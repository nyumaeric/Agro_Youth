"use client"
import { useState, ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import showToast from "@/utils/showToast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addUser } from "@/services/userRegister";
import { registerSchema } from "@/validator/registrationValidator";

const initialData = {
  fullName: "",
  phoneNumber: "",
  user_type: "farmer" as "farmer" | "buyer",
  password: ""
};

export const useAddUsers = () => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: addUser,
    onSuccess: (response) => {
      queryClient.invalidateQueries();
      setFormData(initialData);
      setErrors({});
      showToast(response.message, "success");
      
      setShowVerificationPopup(true);
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
    onError: (err: unknown) => {
      const error = err as Error;
      const errorMessage = error.message || "Registration failed";
      showToast(errorMessage, "error");
      setErrors({ general: errorMessage });
    }
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, name, value } = e.target;
    const fieldName = id || name;
    
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (errors[fieldName]) {
      setErrors(prev => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleRadioChange = (value: "farmer" | "buyer") => {
    setFormData(prev => ({ ...prev, user_type: value }));
    
    if (errors.user_type) {
      setErrors(prev => {
        const { user_type: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = () => {
    try {
      registerSchema.parse(formData);
      const userToRegister = {
        ...formData,
        userType: formData.user_type,
      };
      mutate(userToRegister);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.reduce(
          (acc: Record<string, string>, curr) => {
            const key = String(curr.path[0] ?? '');
            acc[key] = curr.message;
            return acc;
          },
          {} as Record<string, string>
        );
        setErrors(fieldErrors);
        
        const firstError = Object.values(fieldErrors)[0];
        if (firstError) {
          showToast(firstError, "error");
        }
      }
    }
  };

  const handleClosePopup = () => {
    setShowVerificationPopup(false);
    router.push("/login");
  };

  return {
    formData,
    errors,
    handleChange,
    handleRadioChange,
    handleSubmit,
    isPending,
    showVerificationPopup,
    handleClosePopup
  };
};