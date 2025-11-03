import { UserInterface } from "@/types/user";
import axios from "axios";

export const addUser = async (newUser: UserInterface) => {
    try {
        const response = await axios.post("/api/register", newUser);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw error.response.data;
        }
        throw error;
    }
};