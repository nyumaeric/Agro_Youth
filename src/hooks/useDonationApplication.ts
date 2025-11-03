import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface DonationApplication {
  id: string;
  userId: string;
  applicantName?: string;
  applicantEmail?: string;
  projectTitle: string;
  organization?: string;
  projectDescription: string;
  projectGoals: string;
  budgetAmount: number;
  duration: string;
  expectedImpact: string;
  certificates: string[];
  status: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const useUserApplications = () => {
  return useQuery<DonationApplication[]>({
    queryKey: ['donationApplications'],
    queryFn: async () => {
      const response = await axios.get('/api/donations/apply');
      return response.data.data;
    },
  });
};

export const useAllApplications = () => {
  return useQuery<DonationApplication[]>({
    queryKey: ['allDonationApplications'],
    queryFn: async () => {
      const response = await axios.get('/api/donations/apply/investor');
      return response.data.data;
    },
  });
};

export const useReviewApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      reviewNotes,
    }: {
      applicationId: string;
      status: 'approved' | 'rejected';
      reviewNotes: string;
    }) => {
      const response = await axios.patch(
        `/api/donations/apply/investor/${applicationId}`,
        { status, reviewNotes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDonationApplications'] });
    },
  });
};


  export const useApplication = (applicationId: string) => {
    return useQuery<DonationApplication>({
      queryKey: ['application', applicationId],
      queryFn: async () => {
        const response = await axios.get(`/api/donations/apply/${applicationId}`);
        return response.data.data;
      },
      enabled: !!applicationId,
    });
  };
  
  // Delete application
//   export const useDeleteApplication = () => {
//     const queryClient = useQueryClient();
  
//     return useMutation({
//       mutationFn: async (applicationId: string) => {
//         const response = await axios.delete(`/api/donations/applications/${applicationId}`);
//         return response.data;
//       },
//       onSuccess: () => {
//         queryClient.invalidateQueries({ queryKey: ['userApplications'] });
//       },
//     });
//   };
