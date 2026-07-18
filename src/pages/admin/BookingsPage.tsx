import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  MessageCircle,
  Download,
  Trash2,
} from "lucide-react";

const toCSV = (rows: Booking[]) => {
  const cols: (keyof Booking)[] = [
    "created_at",
    "customer_name",
    "whatsapp",
    "email",
    "laptop_name",
    "quantity",
    "start_date",
    "end_date",
    "status",
    "locale",
    "source_page",
    "notes",
  ];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => esc(r[c])).join(",")),
  ].join("\n");
};

const downloadCSV = (filename: string, csv: string) => {
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Status = Database["public"]["Enums"]["booking_status"];

const statuses: Status[] = [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
];

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  confirmed: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const overlaps = (a: Booking, b: Booking) => {
  if (!a.start_date || !a.end_date || !b.start_date || !b.end_date)
    return false;
  return a.start_date <= b.end_date && b.start_date <= a.end_date;
};

const BookingsPage = () => {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error)
      toast({
        title: "Load failed",
        description: error.message,
        variant: "destructive",
      });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Realtime: toast + sound when new booking arrives
  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          const b = payload.new as Booking;
          setItems((prev) =>
            prev.some((x) => x.id === b.id) ? prev : [b, ...prev],
          );
          toast({
            title: "🔔 Booking baru!",
            description: `${b.customer_name} · ${b.laptop_name ?? "—"} · ${b.quantity} unit`,
          });
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("Booking baru — TeknoKerja", {
              body: `${b.customer_name} (${b.whatsapp})`,
            });
          }
        },
      )
      .subscribe();
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const remove = async (id: string, customerName: string) => {
    if (
      !confirm(
        `Hapus booking dari "${customerName}"? Tindakan ini tidak bisa dibatalkan.`,
      )
    )
      return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error)
      return toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    setItems((it) => it.filter((b) => b.id !== id));
    toast({ title: "Booking dihapus" });
  };

  // detect conflicts per booking — same laptop_id, overlapping date, not cancelled/completed
  const conflictIds = useMemo(() => {
    const set = new Set<string>();
    const active = items.filter(
      (b) =>
        b.laptop_id && b.status !== "cancelled" && b.status !== "completed",
    );
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        if (
          active[i].laptop_id === active[j].laptop_id &&
          overlaps(active[i], active[j])
        ) {
          set.add(active[i].id);
          set.add(active[j].id);
        }
      }
    }
    return set;
  }, [items]);

  const filtered = items.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.customer_name.toLowerCase().includes(q) ||
      b.whatsapp.toLowerCase().includes(q) ||
      (b.laptop_name ?? "").toLowerCase().includes(q) ||
      (b.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-headline">Booking Requests</h1>
          <p className="text-sm text-caption">
            {loading
              ? "Memuat…"
              : `${filtered.length} dari ${items.length} permintaan`}
            {conflictIds.size > 0 && (
              <span className="ml-2 text-amber-600">
                · {conflictIds.size} potensi bentrok
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari nama/WA/laptop…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 h-9"
          />
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCSV(
                `bookings-${new Date().toISOString().slice(0, 10)}.csv`,
                toCSV(filtered),
              )
            }
            disabled={filtered.length === 0}
          >
            <Download className="w-3.5 h-3.5 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 w-6"></th>
              <th className="p-3 font-medium">Tanggal</th>
              <th className="p-3 font-medium">Nama</th>
              <th className="p-3 font-medium">WhatsApp</th>
              <th className="p-3 font-medium">Laptop</th>
              <th className="p-3 font-medium">Periode</th>
              <th className="p-3 font-medium">Qty</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-caption">
                  Tidak ada booking.
                </td>
              </tr>
            )}
            {filtered.map((b) => {
              const expanded = open === b.id;
              const conflict = conflictIds.has(b.id);
              return (
                <Fragment key={b.id}>
                  <tr
                    className={`border-t border-border align-top ${conflict ? "bg-amber-500/5" : ""}`}
                  >
                    <td className="p-3">
                      <button
                        onClick={() => setOpen(expanded ? null : b.id)}
                        className="text-caption hover:text-headline"
                      >
                        {expanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 whitespace-nowrap text-xs text-caption">
                      {new Date(b.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 font-medium text-headline">
                      <div className="flex items-center gap-1.5">
                        {b.customer_name}
                        {conflict && (
                          <AlertTriangle
                            className="w-3.5 h-3.5 text-amber-600"
                            aria-label="Bentrok jadwal"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <a
                        className="text-primary hover:underline flex items-center gap-1"
                        href={`https://wa.me/${b.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener"
                      >
                        <MessageCircle className="w-3 h-3" />
                        {b.whatsapp}
                      </a>
                    </td>
                    <td className="p-3">{b.laptop_name ?? "—"}</td>
                    <td className="p-3 text-xs">
                      {b.start_date ?? "—"} → {b.end_date ?? "—"}
                    </td>
                    <td className="p-3">{b.quantity}</td>
                    <td className="p-3">
                      <Select
                        value={b.status}
                        onValueChange={(v) => updateStatus(b.id, v as Status)}
                      >
                        <SelectTrigger
                          className={`h-8 w-[130px] ${statusColor[b.status]}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(b.id, b.customer_name)}
                        title="Hapus booking"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="border-t border-border bg-muted/30">
                      <td colSpan={9} className="p-4 text-xs space-y-1">
                        <div>
                          <strong>Email:</strong> {b.email ?? "—"}
                        </div>
                        <div>
                          <strong>Locale:</strong> {b.locale ?? "—"}
                        </div>
                        <div>
                          <strong>Source page:</strong> {b.source_page ?? "—"}
                        </div>
                        <div>
                          <strong>Catatan:</strong> {b.notes ?? "—"}
                        </div>
                        {conflict && (
                          <div className="text-amber-700 dark:text-amber-300 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Bentrok
                            dengan booking lain untuk laptop yang sama.
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default BookingsPage;
