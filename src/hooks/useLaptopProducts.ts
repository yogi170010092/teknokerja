import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LaptopProduct } from "@/lib/scrapeProducts";

const formatRp = (n: number | null | undefined) =>
  n && n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "—";

export interface DBLaptopProduct extends LaptopProduct {
  dbId?: string;
  status?: string;
  priceDaily?: number | null;
  priceWeekly?: number | null;
  priceMonthly?: number | null;
}

export function useLaptopProducts() {
  return useQuery<DBLaptopProduct[]>({
    queryKey: ["laptop-products-db"],
    queryFn: async () => {
      // Get all laptops; we'll sort client-side so we can prioritize ready first.
      const { data, error } = await supabase
        .from("laptops")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const statusRank: Record<string, number> = {
        ready: 1,
        rented: 2,
        maintenance: 3,
      };

      const rows = (data ?? []).slice().sort((a: any, b: any) => {
        const ra = statusRank[a.status] ?? 9;
        const rb = statusRank[b.status] ?? 9;
        if (ra !== rb) return ra - rb;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return rows.map<DBLaptopProduct>((l: any) => ({
        id: l.id,
        dbId: l.id,
        name: l.name,
        brand: l.brand ?? "",
        price: formatRp(l.price_daily) + "/hari",
        image:
          l.photo_url ||
          "https://placehold.co/600x450/eef2ff/9F7AEA?text=Laptop",
        specs: [l.processor, l.ram, l.ssd, l.vga].filter(Boolean) as string[],
        condition: l.status === "ready" ? "Available" : l.status === "rented" ? "Rented" : "Maintenance",
        detailUrl: "#",
        status: l.status,
        priceDaily: l.price_daily,
        priceWeekly: l.price_weekly,
        priceMonthly: l.price_monthly,
      }));
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
