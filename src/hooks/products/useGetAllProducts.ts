"use client";
import { getAllProducts, getAllProductsByUser } from "@/services/products/getProducts";
import { useQuery } from "@tanstack/react-query";

export const useAllProductsByUser = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: () => getAllProductsByUser(),
        retry: false,
      });
}

export const useAllProducts = () => {
    return useQuery({
        queryKey: ["all-products"],
        queryFn: () => getAllProducts(),
        retry: false,
      });
}