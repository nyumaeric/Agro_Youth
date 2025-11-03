import { getUserService } from "@/services/getUserInfo";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


export const useGetUserInfo = () => {
    const {data, isPending, error} = useQuery({
      queryKey: ["userInfo"],
      queryFn: getUserService
    });
    return {
        data,
        isPending,
        error
    }
};


export const useGetAllUsers = () => {
    const {data, isPending, error} = useQuery({
      queryKey: ["users"],
      queryFn: async () => {
        const response = await axios.get('/api/auth/users');
        return response.data;
      }
    });
    return {
        data,
        isPending,
        error
    }
}
