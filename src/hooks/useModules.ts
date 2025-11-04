import { ModuleData, updateModules } from "@/services/modules";
import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";



export const useUpdateModules = () => {
    const queryClient = useQueryClient();
    
    const { mutate, isPending } = useMutation({
      mutationFn: ({ id, ids, data }: { id: string; ids: string; data: ModuleData }) => 
        updateModules(id, ids, data),
      onSuccess: (response, variables) => {
        showToast(response.message || "Module updated successfully", "success");
        
        // Invalidate the specific module query with correct keys
        queryClient.invalidateQueries({ 
          queryKey: ["course-module", variables.id, variables.ids] 
        });
        
        // Invalidate the course query to update module list
        queryClient.invalidateQueries({ 
          queryKey: ["course", variables.id] 
        });
        
        // Also invalidate course progress if you have it
        queryClient.invalidateQueries({ 
          queryKey: ["course-progress", variables.id] 
        });
      },
      onError: (err: unknown) => {
        const error = err as Error;
        const errorMessage = error.message || "An error occurred while updating the module";
        showToast(errorMessage, "error");
      }
    });
  
    return { mutate, isPending };
};