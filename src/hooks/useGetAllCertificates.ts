import { getAllCertificatesByUser } from "@/services/getCourse";
import { useQuery } from "@tanstack/react-query";

export const useAllCertificatesByUser = () => {
    return useQuery({
        queryKey: ["all-certificates"],
        queryFn: () => getAllCertificatesByUser(),
      });
}