import axios from "axios";

export const getUserService = async() => {
    try {
        const response = await axios.get('/api/profile');
        return response.data;
    } catch (error) {
        throw error; 
    }
}