import axios from "axios";

export const getAllUsers = async () => {
    try {
        const response = axios.get(`/api/users`);
        return (await response).data;
    } catch (error) {
        return error;
    }
}