import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

// Harus sama dengan REMINDER_HOURS_BEFORE & CATCH_UP_HOURS di edge function, biar konsisten
const REMINDER_HOURS_BEFORE = 4;
const CATCH_UP_HOURS = 24;

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const normalizeTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

// Hitung deadline (end_date + end_time) sebagai objek Date, dalam WIB (UTC+7)
const getDeadline = (b: Booking): Date | null => {
  if (!b.end_date) return null;
  const timePart = normalizeTime(b.end_time ?? "23:59:00");
  const d = new Date(`${b.end_date}T${timePart}+07:00`);
  return isNaN(d.getTime()) ? null : d;
};

export function NotificationBell() {
  const [expiring, setExpiring] = useState<Booking[]>([]);
  const navigate = useNavigate();

  const load = async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ambil kandidat longgar dari DB (kemarin s/d besok), presisi jam dihitung di JS
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .in("status", ["active", "confirmed"])
      .gte("end_date", ymd(yesterday))
      .lte("end_date", ymd(tomorrow))
      .order("end_date", { ascending: true });

    const due = (data ?? []).filter((b) => {
      const deadline = getDeadline(b);
      if (!deadline) return false;
      const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursLeft <= REMINDER_HOURS_BEFORE && hoursLeft >= -CATCH_UP_HOURS;
    });

    due.sort((a, b) => (getDeadline(a)?.getTime() ?? 0) - (getDeadline(b)?.getTime() ?? 0));

    setExpiring(due);
  };

  useEffect(() => {
    load();
    // refresh tiap 5 menit selagi admin buka panel
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hoursLeftLabel = (b: Booking) => {
    const deadline = getDeadline(b);
    if (!deadline) return { text: "—", urgent: false };
    const hours = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hours <= 0) return { text: "Sudah lewat / sekarang", urgent: true };
    if (hours < 1) return { text: `${Math.round(hours * 60)} menit lagi`, urgent: true };
    return { text: `${Math.round(hours)} jam lagi`, urgent: hours <= 1 };
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {expiring.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {expiring.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <p className="text-xs font-medium text-headline px-2 py-1">
          Sewa akan berakhir ({REMINDER_HOURS_BEFORE} jam ke depan)
        </p>
        {expiring.length === 0 ? (
          <p className="text-xs text-caption px-2 py-2">Tidak ada yang perlu dikonfirmasi.</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {expiring.map((b) => {
              const { text, urgent } = hoursLeftLabel(b);
              return (
                <button
                  key={b.id}
                  onClick={() => navigate("/admin/calendar")}
                  className="w-full text-left text-xs rounded px-2 py-2 hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-headline">{b.customer_name}</div>
                  <div className="text-caption">
                    {b.laptop_name ?? "—"} · selesai {b.end_date}
                    {b.end_time ? ` ${b.end_time}` : ""}
                  </div>
                  <div className={urgent ? "text-rose-600 font-medium" : "text-amber-600"}>
                    {text}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}