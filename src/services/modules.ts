import axios from "axios";
export interface ModuleData {
    title?: string;
    content?: string;
    isCompleted?:boolean;
    durationTime?: string;
}
export const updateModules = async(id: string, ids: string, data: ModuleData) => {
    try {
        const response = await axios.patch(`/api/courses/${id}/modules/${ids}`, data);
        return response.data;
    } catch (error) {
        // Throw the error so React Query can catch it
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to update module");
        }
        throw error;
    }
}