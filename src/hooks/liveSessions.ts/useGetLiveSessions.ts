"use client";
import { getAllLiveSessions, getLiveSessionsByUser } from "@/services/liveSessions/getLiveSession";
import { useQuery } from "@tanstack/react-query";

export const useAllLiveSessionsByUser = () => {
    return useQuery({
        queryKey: ["livesessions"],
        queryFn: () => getLiveSessionsByUser(),
        retry: false,
      });
}

export const useAllLiveSessions = () => {
    return useQuery({
        queryKey: ["all-livesessions"],
        queryFn: () => getAllLiveSessions(),
        retry: false,
      });
}