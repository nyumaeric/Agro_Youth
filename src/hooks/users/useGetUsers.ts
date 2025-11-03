import { getAllUsers } from "@/services/users/getUsers";
import { useQuery } from "@tanstack/react-query";

export const useAllUser = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsers(),
        retry: false,
      });
}