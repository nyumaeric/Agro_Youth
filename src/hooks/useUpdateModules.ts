import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import showToast from "@/utils/showToast";

interface UpdateModuleData {
  id: string; // courseId
  ids: string; // moduleId
  data: {
    isCompleted: boolean;
  };
}

export const useUpdateModules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ids, data }: UpdateModuleData) => {
      const response = await axios.patch(
        `/api/courses/${id}/modules/${ids}`,
        data
      );
      return response.data;
    },
    onSuccess: (responseData, variables) => {
      const { id: courseId, ids: moduleId, data } = variables;
      const progressData = responseData?.data?.progress;

      // Show appropriate toast message
      if (data.isCompleted) {
        if (progressData?.isCompleted) {
          showToast("🎉 Congratulations! You've completed the course!", "success");
        } else {
          showToast(`Module completed! Progress: ${progressData?.progressPercentage}%`, "success");
        }
      } else {
        showToast("Module marked as incomplete", "success");
      }

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-module", courseId, moduleId] });
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update module";
      showToast(errorMessage, "error");
    },
  });
};