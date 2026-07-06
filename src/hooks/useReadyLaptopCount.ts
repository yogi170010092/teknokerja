import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Live count of laptops with status='ready'. Refetches every 60s. */
export function useReadyLaptopCount() {
  return useQuery<number>({
    queryKey: ["ready-laptop-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("laptops")
        .select("id", { count: "exact", head: true })
        .eq("status", "ready");
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
