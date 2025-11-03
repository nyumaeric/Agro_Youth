'use client';

import { getSingleCourse, getSingleCourseModule } from '@/services/getCourse';
import showToast from '@/utils/showToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Module {
  id: string;
  title: string;
  content: string;
  durationTime: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  createdId: string;
  title: string;
  description: string;
  timeToComplete: string;
  level: string;
  category: string;
  language: string;
  moduleCount: number;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: Course;
}

export const useCourse = (id: string) => {
  return useQuery<ApiResponse>({
    queryKey: ["course", id],
    queryFn: async () => getSingleCourse(id),
    enabled: !!id,
  });
};


export const useCourseModule = (courseId: string, moduleId: string) => {
    return useQuery({
      queryKey: ["course-module", courseId, moduleId],
      queryFn: async () => getSingleCourseModule(courseId, moduleId),
      enabled: !!courseId && !!moduleId, 
    });
};

// Fixed hook - removed premature optimistic update for enrollments
export const useEnrolledCourses = (userId: string) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/api/courses/${id}/enroll`, {
        user_id: userId,
      });
      return response.data;
    },
    
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
      queryClient.setQueryData(["enrollments", userId], (old: any) => {
        if (!old) return { data: [] };
        
        const newEnrollment = {
          courseId: courseId,
          course_id: courseId,
          completionPercentage: 0,
          completion_percentage: 0,
          completedModules: 0,
          completed_modules: 0,
          totalModules: 0,
          total_modules: 0
        };
        
        return {
          ...old,
          data: [...(old.data || []), newEnrollment]
        };
      });
      
      // Invalidate to get fresh data from server
      queryClient.invalidateQueries({ queryKey: ["enrollments", userId] });
    },
    
    onError: (error) => {
      console.error("Failed to join course", error);
    },
  });

  return {
    enrollCourse: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};


export const useUnenrollCourse = (userId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/api/courses/${id}/enroll`, { userId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error("Failed to exit course", error);
    }
  });

  return {
    exitCourse: mutation.mutate, 
    isPending: mutation.isPending,
    error: mutation.error
  };
};

