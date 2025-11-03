import axios from "axios";

export const getLiveSessionsByUser = async() => {
    try {
        const response = await axios.get(`/api/livesessions`);
        return response.data;
    } catch (error) {
        return error;
    }
}

export const getAllLiveSessions = async() => {
    try {
        const response = await axios.get(`/api/livesessions/all`);
        return response.data;
    } catch (error) {
        return error;
    }
}