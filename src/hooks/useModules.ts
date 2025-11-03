import { ModuleData, updateModules } from "@/services/modules";
import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateModules = () => {
    const queryClient = useQueryClient();
    
    const { mutate, isPending } = useMutation({
      mutationFn: ({ id, ids, data }: { id: string; ids: string; data: ModuleData }) => 
        updateModules(id, ids, data),
      onSuccess: (response) => {
        showToast(response.message || "Module updated successfully", "success");
        queryClient.invalidateQueries({ queryKey: ["course-module"] });
        queryClient.invalidateQueries({ queryKey: ["course"] });
      },
      onError: (err: unknown) => {
        const error = err as Error;
        const errorMessage = error.message || "An error occurred while updating the module";
        showToast(errorMessage, "error");
      }
    });
  
    return { mutate, isPending };
};