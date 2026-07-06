import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const Empty = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="space-y-3">
    <h1 className="text-2xl font-bold text-headline">{title}</h1>
    {hint && <p className="text-sm text-caption">{hint}</p>}
    <Card className="p-8 text-center text-sm text-caption">
      Fitur manajemen lengkap akan ditambahkan di fase berikutnya. Data sudah dapat disimpan ke database.
    </Card>
  </div>
);

export const TestimonialsPage = () => <Empty title="Testimonials" hint="Kelola screenshot WhatsApp, rating, dan komentar pelanggan." />;
export const ArticlesPage = () => <Empty title="Articles" hint="Kelola blog artikel & kategori untuk SEO." />;
export const SeoSettingsPage = () => <Empty title="SEO Settings" hint="Meta tag global, schema, sitemap." />;
export const SettingsPage = () => <Empty title="Website Settings" hint="Pengaturan kontak, sosial media, copy global." />;

export const LeadsPage = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("whatsapp_leads").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-headline">WhatsApp Leads</h1>
      <p className="text-sm text-caption">{loading ? "Memuat…" : `${rows.length} event terakhir`}</p>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 font-medium">Waktu</th>
              <th className="p-3 font-medium">Event</th>
              <th className="p-3 font-medium">Kategori</th>
              <th className="p-3 font-medium">Lokasi</th>
              <th className="p-3 font-medium">Lokal</th>
              <th className="p-3 font-medium">Halaman</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr><td colSpan={6} className="p-8 text-center text-caption">Belum ada event.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border text-xs">
                <td className="p-3 text-caption whitespace-nowrap">{new Date(r.created_at).toLocaleString("id-ID")}</td>
                <td className="p-3 font-medium">{r.event_type}</td>
                <td className="p-3">{r.service_category ?? "—"}</td>
                <td className="p-3">{r.location ?? "—"}</td>
                <td className="p-3">{r.locale ?? "—"}</td>
                <td className="p-3 truncate max-w-[200px]">{r.page_path ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export const LogsPage = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-headline">Activity Logs</h1>
      <p className="text-sm text-caption">{loading ? "Memuat…" : `${rows.length} aktivitas`}</p>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 font-medium">Waktu</th>
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Aksi</th>
              <th className="p-3 font-medium">Entitas</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr><td colSpan={4} className="p-8 text-center text-caption">Belum ada aktivitas.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border text-xs">
                <td className="p-3 text-caption whitespace-nowrap">{new Date(r.created_at).toLocaleString("id-ID")}</td>
                <td className="p-3">{r.user_email ?? "—"}</td>
                <td className="p-3 font-medium">{r.action}</td>
                <td className="p-3">{r.entity_type ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
