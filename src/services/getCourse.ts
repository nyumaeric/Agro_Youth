import axios from "axios";

export const getSingleCourse = async (id: string) => {
    try {
        const response = axios.get(`/api/courses/${id}`);
        return (await response).data;
    } catch (error) {
        return error;
    }
}

export const getSingleCourseModule = async (id: string, ids: string) => {
    try {
        const response = axios.get(`/api/courses/${id}/modules/${ids}`);
        return (await response).data;
    } catch (error) {
        return error;
    }
}