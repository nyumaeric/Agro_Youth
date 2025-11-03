import { getAllInvestors } from "@/services/getAllInvestors";
import { useQuery } from "@tanstack/react-query";

export const useAllInvestors = () => {
    return useQuery({
        queryKey: ["investors"],
        queryFn: () => getAllInvestors(),
        retry: false,
      });
}