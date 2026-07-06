import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, CheckCircle, Wrench, Inbox, FileText, Star, MessageCircle, TrendingUp } from "lucide-react";

interface Stats {
  laptopsTotal: number;
  laptopsReady: number;
  laptopsRented: number;
  laptopsMaintenance: number;
  bookingsTotal: number;
  bookingsPending: number;
  articles: number;
  testimonials: number;
  leadsTotal: number;
  whatsappClicks: number;
}

const initial: Stats = {
  laptopsTotal: 0, laptopsReady: 0, laptopsRented: 0, laptopsMaintenance: 0,
  bookingsTotal: 0, bookingsPending: 0, articles: 0, testimonials: 0,
  leadsTotal: 0, whatsappClicks: 0,
};

const Overview = () => {
  const [s, setS] = useState<Stats>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const head = (q: any) => q.then((r: any) => r.count ?? 0);
      const [
        lt, lr, lren, lm, bt, bp, art, te, ld, wa,
      ] = await Promise.all([
        head(supabase.from("laptops").select("*", { count: "exact", head: true })),
        head(supabase.from("laptops").select("*", { count: "exact", head: true }).eq("status", "ready")),
        head(supabase.from("laptops").select("*", { count: "exact", head: true }).eq("status", "rented")),
        head(supabase.from("laptops").select("*", { count: "exact", head: true }).eq("status", "maintenance")),
        head(supabase.from("bookings").select("*", { count: "exact", head: true })),
        head(supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending")),
        head(supabase.from("articles").select("*", { count: "exact", head: true })),
        head(supabase.from("testimonials").select("*", { count: "exact", head: true })),
        head(supabase.from("whatsapp_leads").select("*", { count: "exact", head: true })),
        head(supabase.from("whatsapp_leads").select("*", { count: "exact", head: true }).eq("event_type", "whatsapp_click")),
      ]);
      setS({
        laptopsTotal: lt, laptopsReady: lr, laptopsRented: lren, laptopsMaintenance: lm,
        bookingsTotal: bt, bookingsPending: bp, articles: art, testimonials: te,
        leadsTotal: ld, whatsappClicks: wa,
      });
      setLoading(false);
    })();
  }, []);

  const tiles = [
    { label: "Total Laptops", value: s.laptopsTotal, icon: Laptop, color: "text-primary" },
    { label: "Ready", value: s.laptopsReady, icon: CheckCircle, color: "text-green-600" },
    { label: "Rented", value: s.laptopsRented, icon: TrendingUp, color: "text-orange-600" },
    { label: "Maintenance", value: s.laptopsMaintenance, icon: Wrench, color: "text-yellow-600" },
    { label: "Total Bookings", value: s.bookingsTotal, icon: Inbox, color: "text-primary" },
    { label: "Pending Bookings", value: s.bookingsPending, icon: Inbox, color: "text-amber-600" },
    { label: "Articles", value: s.articles, icon: FileText, color: "text-primary" },
    { label: "Testimonials", value: s.testimonials, icon: Star, color: "text-primary" },
    { label: "Total Leads", value: s.leadsTotal, icon: TrendingUp, color: "text-primary" },
    { label: "WhatsApp Clicks", value: s.whatsappClicks, icon: MessageCircle, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-headline">Dashboard Overview</h1>
        <p className="text-sm text-caption">Ringkasan operasional TeknoKerja.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tiles.map((t) => (
          <Card key={t.label} className="hover-lift">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium text-caption">{t.label}</CardTitle>
              <t.icon className={`w-4 h-4 ${t.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-headline">
                {loading ? "—" : t.value.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selamat datang</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-body space-y-2">
          <p>Pondasi backend admin sudah siap. Fitur berikut sudah aktif:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sistem login &amp; role (Super Admin / Staff)</li>
            <li>Stok laptop, booking, testimoni, artikel, leads, activity logs</li>
            <li>Kelola booking baru &amp; status laptop dari menu samping</li>
          </ul>
          <p className="text-caption text-xs pt-2">Fase berikutnya: form booking publik, halaman testimoni publik, blog publik, landing per lokasi.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
