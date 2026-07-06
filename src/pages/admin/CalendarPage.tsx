import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  confirmed: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);

const CalendarPage = () => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth(), 1), [cursor]);
  const monthEnd = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0), [cursor]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // load bookings that intersect this month OR were created this month (so undated still show)
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .or(
          `and(start_date.lte.${ymd(monthEnd)},end_date.gte.${ymd(monthStart)}),and(start_date.is.null,created_at.gte.${monthStart.toISOString()},created_at.lt.${new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1).toISOString()})`
        )
        .order("start_date", { ascending: true, nullsFirst: false });
      setItems(data ?? []);
      setLoading(false);
    })();
  }, [monthStart, monthEnd, cursor]);

  // Group bookings per day
  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    items.forEach((b) => {
      if (!b.start_date) return;
      const start = new Date(b.start_date);
      const end = b.end_date ? new Date(b.end_date) : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d < monthStart || d > monthEnd) continue;
        const k = ymd(d);
        const arr = map.get(k) ?? [];
        arr.push(b);
        map.set(k, arr);
      }
    });
    return map;
  }, [items, monthStart, monthEnd]);

  // Build grid weeks (Mon-Sun)
  const cells = useMemo(() => {
    const startDow = (monthStart.getDay() + 6) % 7; // Mon=0
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= monthEnd.getDate(); d++) days.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [monthStart, monthEnd, cursor]);

  const undated = items.filter((b) => !b.start_date);
  const monthLabel = cursor.toLocaleString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-headline">Calendar</h1>
          <p className="text-sm text-caption">{loading ? "Memuat…" : `${items.length} booking di ${monthLabel}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="font-medium text-headline w-40 text-center capitalize">{monthLabel}</div>
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Hari ini</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 bg-muted text-xs font-medium text-caption">
          {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d) => (
            <div key={d} className="p-2 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="min-h-[110px] border-t border-l border-border bg-muted/30" />;
            const k = ymd(day);
            const list = byDay.get(k) ?? [];
            const isToday = ymd(new Date()) === k;
            return (
              <div key={i} className="min-h-[110px] border-t border-l border-border p-1.5 last:border-r-0">
                <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-headline"}`}>{day.getDate()}</div>
                <div className="space-y-1">
                  {list.slice(0, 3).map((b) => (
                    <Link key={b.id} to="/admin/bookings" className={`block text-[10px] truncate rounded px-1.5 py-0.5 ${statusColor[b.status] ?? ""}`} title={`${b.customer_name} · ${b.laptop_name ?? "—"}`}>
                      {b.customer_name}{b.laptop_name ? ` · ${b.laptop_name}` : ""}
                    </Link>
                  ))}
                  {list.length > 3 && <div className="text-[10px] text-caption px-1.5">+{list.length - 3} lainnya</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {undated.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold text-headline mb-2">Tanpa tanggal (dibuat bulan ini)</h2>
          <ul className="text-sm space-y-1">
            {undated.map((b) => (
              <li key={b.id} className="flex items-center justify-between border-b border-border last:border-0 py-1">
                <span>{b.customer_name} · {b.laptop_name ?? "—"} · {b.quantity} unit</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${statusColor[b.status] ?? ""}`}>{b.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-caption">
        {Object.entries(statusColor).map(([s, c]) => (
          <span key={s} className={`px-2 py-0.5 rounded ${c}`}>{s}</span>
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;
