import { useQuery } from "@tanstack/react-query";
import { fetchLaptopProducts, type LaptopProduct } from "@/lib/scrapeProducts";

export function useLaptopProducts() {
  return useQuery<LaptopProduct[]>({
    queryKey: ["laptop-products"],
    queryFn: fetchLaptopProducts,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
