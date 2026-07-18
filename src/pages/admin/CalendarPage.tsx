import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  CalendarPlus,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useLaptopProducts } from "@/hooks/useLaptopProducts";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type BookingStatus = Database["public"]["Enums"]["booking_status"];

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  confirmed: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const bookingStatuses: BookingStatus[] = [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
];

const ymd = (d: Date) => d.toISOString().slice(0, 10);

const emptyManualForm = {
  laptopId: "",
  customerName: "",
  whatsapp: "",
  email: "",
  address: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  status: "confirmed" as BookingStatus,
  notes: "",
};

const CalendarPage = () => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Manual booking dialog state ---
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [manualForm, setManualForm] = useState(emptyManualForm);
  const [saving, setSaving] = useState(false);
  const { data: laptops } = useLaptopProducts();

  // --- Extend booking dialog state ---
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [newEndDate, setNewEndDate] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [extendNote, setExtendNote] = useState("");
  const [extending, setExtending] = useState(false);

  // --- Day detail dialog state (untuk "+X lainnya") ---
  const [dayDetail, setDayDetail] = useState<{ date: Date; bookings: Booking[] } | null>(null);

  const monthStart = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    [cursor],
  );
  const monthEnd = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0),
    [cursor],
  );

  const loadBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .or(
        `and(start_date.lte.${ymd(monthEnd)},end_date.gte.${ymd(monthStart)}),and(start_date.is.null,created_at.gte.${monthStart.toISOString()},created_at.lt.${new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1).toISOString()})`,
      )
      .order("start_date", { ascending: true, nullsFirst: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    for (let d = 1; d <= monthEnd.getDate(); d++)
      days.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [monthStart, monthEnd, cursor]);

  const undated = items.filter((b) => !b.start_date);
  const monthLabel = cursor.toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // --- Manual booking handlers ---
  const openAddDialog = () => {
    setManualForm(emptyManualForm);
    setShowAddDialog(true);
  };

  const handleStartTimeChange = (value: string) => {
    setManualForm((prev) => ({
      ...prev,
      startTime: value,
      // jam selesai otomatis ikut jam mulai (sewa 24 jam),
      // kecuali admin sudah mengubah jam selesai secara manual
      endTime: prev.endTime === prev.startTime ? value : prev.endTime,
    }));
  };

  const closeAddDialog = () => {
    setShowAddDialog(false);
    setManualForm(emptyManualForm);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !manualForm.customerName.trim() ||
      !manualForm.whatsapp.trim() ||
      !manualForm.startDate ||
      !manualForm.endDate
    ) {
      toast({
        title: "Data belum lengkap",
        description: "Nama, WhatsApp, dan tanggal wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (manualForm.endDate < manualForm.startDate) {
      toast({
        title: "Tanggal tidak valid",
        description: "Tanggal selesai harus setelah tanggal mulai",
        variant: "destructive",
      });
      return;
    }

    const selectedLaptop = laptops?.find((l) => l.dbId === manualForm.laptopId);

    setSaving(true);
    const combinedNotes = [
      manualForm.address.trim() ? `Alamat: ${manualForm.address.trim()}` : null,
      manualForm.notes.trim() ? `Catatan: ${manualForm.notes.trim()}` : null,
      "(Input manual oleh admin — order via WhatsApp)",
    ]
      .filter(Boolean)
      .join(" | ");

    const { error } = await supabase.from("bookings").insert({
      customer_name: manualForm.customerName.trim(),
      whatsapp: manualForm.whatsapp.trim(),
      email: manualForm.email.trim() || null,
      laptop_id: manualForm.laptopId || null,
      laptop_name: selectedLaptop?.name || null,
      quantity: 1,
      start_date: manualForm.startDate,
      start_time: manualForm.startTime || null,
      end_date: manualForm.endDate,
      end_time: manualForm.endTime || null,
      notes: combinedNotes,
      status: manualForm.status,
      source_page: "admin_manual_input",
    });

    setSaving(false);

    if (error) {
      toast({
        title: "Gagal menyimpan",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Booking manual berhasil ditambahkan" });
    closeAddDialog();
    loadBookings();
  };

  // --- Extend booking handlers ---
  const openExtendDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewEndDate(booking.end_date ?? "");
    setNewEndTime(booking.end_time ?? "");
    setExtendNote("");
    setShowExtendDialog(true);
  };

  const closeExtendDialog = () => {
    setShowExtendDialog(false);
    setSelectedBooking(null);
    setNewEndDate("");
    setNewEndTime("");
    setExtendNote("");
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    if (!newEndDate) {
      toast({
        title: "Tanggal belum diisi",
        description: "Pilih tanggal selesai sewa yang baru",
        variant: "destructive",
      });
      return;
    }

    const oldEndDate = selectedBooking.end_date;
    if (oldEndDate && newEndDate <= oldEndDate) {
      toast({
        title: "Tanggal tidak valid",
        description:
          "Tanggal perpanjangan harus setelah tanggal selesai sebelumnya",
        variant: "destructive",
      });
      return;
    }

    setExtending(true);

    const extensionLog = `(Diperpanjang oleh admin: ${oldEndDate ?? "-"} ${
      selectedBooking.end_time ?? ""
    } → ${newEndDate} ${newEndTime || ""}${
      extendNote.trim() ? ` | Catatan: ${extendNote.trim()}` : ""
    })`;
    const updatedNotes = [selectedBooking.notes, extensionLog]
      .filter(Boolean)
      .join(" | ");

    const { error } = await supabase
      .from("bookings")
      .update({
        end_date: newEndDate,
        end_time: newEndTime || null,
        admin_notified_at: null, // reset, biar reminder bisa ngirim lagi buat periode baru
        notes: updatedNotes,
        // kalau booking sebelumnya sudah completed/cancelled, aktifkan lagi
        status:
          selectedBooking.status === "completed" ||
          selectedBooking.status === "cancelled"
            ? "active"
            : selectedBooking.status,
      })
      .eq("id", selectedBooking.id);

    setExtending(false);

    if (error) {
      toast({
        title: "Gagal memperpanjang sewa",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Masa sewa berhasil diperpanjang" });
    closeExtendDialog();
    loadBookings();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-headline">Calendar</h1>
          <p className="text-sm text-caption">
            {loading ? "Memuat…" : `${items.length} booking di ${monthLabel}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
              )
            }
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="font-medium text-headline w-40 text-center capitalize">
            {monthLabel}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
              )
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const d = new Date();
              d.setDate(1);
              setCursor(d);
            }}
          >
            Hari ini
          </Button>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="w-4 h-4" /> Tambah Booking
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 bg-muted text-xs font-medium text-caption">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
            <div key={d} className="p-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day)
              return (
                <div
                  key={i}
                  className="min-h-[110px] border-t border-l border-border bg-muted/30"
                />
              );
            const k = ymd(day);
            const list = byDay.get(k) ?? [];
            const isToday = ymd(new Date()) === k;
            return (
              <div
                key={i}
                className="min-h-[110px] border-t border-l border-border p-1.5 last:border-r-0"
              >
                <div
                  className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-headline"}`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {list.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => openExtendDialog(b)}
                      className={`block w-full text-left text-[10px] truncate rounded px-1.5 py-0.5 ${statusColor[b.status] ?? ""}`}
                      title={`${b.customer_name} · ${b.laptop_name ?? "—"} (klik untuk perpanjang sewa)`}
                    >
                      {b.customer_name}
                      {b.laptop_name ? ` · ${b.laptop_name}` : ""}
                    </button>
                  ))}
                  {list.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setDayDetail({ date: day, bookings: list })}
                      className="text-[10px] text-caption px-1.5 hover:underline hover:text-primary"
                    >
                      +{list.length - 3} lainnya
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {undated.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold text-headline mb-2">
            Tanpa tanggal (dibuat bulan ini)
          </h2>
          <ul className="text-sm space-y-1">
            {undated.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between border-b border-border last:border-0 py-1"
              >
                <span>
                  {b.customer_name} · {b.laptop_name ?? "—"} · {b.quantity} unit
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded ${statusColor[b.status] ?? ""}`}
                >
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-caption">
        {Object.entries(statusColor).map(([s, c]) => (
          <span key={s} className={`px-2 py-0.5 rounded ${c}`}>
            {s}
          </span>
        ))}
      </div>

      {/* --- Dialog Tambah Booking Manual --- */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => !open && closeAddDialog()}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Booking Manual</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-caption -mt-2">
            Untuk order yang masuk lewat WhatsApp, bukan lewat website.
          </p>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label>Laptop</Label>
              <Select
                value={manualForm.laptopId}
                onValueChange={(v) =>
                  setManualForm({ ...manualForm, laptopId: v })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih laptop (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {laptops?.map((l) => (
                    <SelectItem key={l.dbId} value={l.dbId!}>
                      {l.name} {l.status !== "ready" ? `(${l.condition})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Nama Customer *</Label>
                <Input
                  required
                  value={manualForm.customerName}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      customerName: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Nama pelanggan"
                />
              </div>
              <div>
                <Label>Nomor WhatsApp *</Label>
                <Input
                  required
                  value={manualForm.whatsapp}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, whatsapp: e.target.value })
                  }
                  className="mt-1"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <Label>Email (opsional)</Label>
              <Input
                type="email"
                value={manualForm.email}
                onChange={(e) =>
                  setManualForm({ ...manualForm, email: e.target.value })
                }
                className="mt-1"
                placeholder="email@contoh.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Mulai Sewa *</Label>
                <Input
                  required
                  type="date"
                  value={manualForm.startDate}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, startDate: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Jam Mulai</Label>
                <Input
                  type="time"
                  value={manualForm.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Selesai Sewa *</Label>
                <Input
                  required
                  type="date"
                  value={manualForm.endDate}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, endDate: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Jam Selesai</Label>
                <Input
                  type="time"
                  value={manualForm.endTime}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, endTime: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Alamat Pengantaran</Label>
              <Textarea
                value={manualForm.address}
                onChange={(e) =>
                  setManualForm({ ...manualForm, address: e.target.value })
                }
                className="mt-1"
                placeholder="Alamat lengkap (opsional)"
              />
            </div>

            <div>
              <Label>Status Booking</Label>
              <Select
                value={manualForm.status}
                onValueChange={(v) =>
                  setManualForm({ ...manualForm, status: v as BookingStatus })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bookingStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catatan Tambahan</Label>
              <Textarea
                value={manualForm.notes}
                onChange={(e) =>
                  setManualForm({ ...manualForm, notes: e.target.value })
                }
                className="mt-1"
                placeholder="Catatan lain (opsional)"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeAddDialog}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Booking"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Dialog Perpanjang Sewa --- */}
      <Dialog
        open={showExtendDialog}
        onOpenChange={(open) => !open && closeExtendDialog()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="w-4 h-4" /> Perpanjang Masa Sewa
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <form onSubmit={handleExtendSubmit} className="space-y-4">
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p className="font-medium text-headline">
                  {selectedBooking.customer_name}
                </p>
                <p className="text-caption">
                  {selectedBooking.laptop_name ?? "—"}
                </p>
                <p className="text-caption">
                  Sewa saat ini: {selectedBooking.start_date ?? "-"} s/d{" "}
                  {selectedBooking.end_date ?? "-"}
                  {selectedBooking.end_time ? ` ${selectedBooking.end_time}` : ""}
                </p>
                <span
                  className={`inline-block text-[10px] px-2 py-0.5 rounded ${statusColor[selectedBooking.status] ?? ""}`}
                >
                  {selectedBooking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tanggal Selesai Baru *</Label>
                  <Input
                    required
                    type="date"
                    min={selectedBooking.end_date ?? undefined}
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Jam Selesai Baru</Label>
                  <Input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Catatan (opsional)</Label>
                <Textarea
                  value={extendNote}
                  onChange={(e) => setExtendNote(e.target.value)}
                  className="mt-1"
                  placeholder="Misal: perpanjang 3 hari, bayar tambahan sudah diterima, dll."
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Link
                  to="/admin/bookings"
                  className="text-xs text-caption underline underline-offset-2 sm:mr-auto"
                  onClick={closeExtendDialog}
                >
                  Lihat detail lengkap booking ini
                </Link>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeExtendDialog}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={extending}>
                    {extending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Menyimpan...
                      </>
                    ) : (
                      "Perpanjang Sewa"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Dialog Detail Semua Booking di Satu Hari --- */}
      <Dialog
        open={!!dayDetail}
        onOpenChange={(open) => !open && setDayDetail(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Booking tanggal{" "}
              {dayDetail?.date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {dayDetail?.bookings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setDayDetail(null);
                  openExtendDialog(b);
                }}
                className={`w-full text-left text-xs rounded px-2 py-2 hover:brightness-95 transition ${statusColor[b.status] ?? "bg-muted"}`}
              >
                <div className="font-medium">
                  {b.customer_name}
                  {b.laptop_name ? ` · ${b.laptop_name}` : ""}
                </div>
                <div className="opacity-80">
                  {b.start_date ?? "-"} s/d {b.end_date ?? "-"}
                  {b.end_time ? ` ${b.end_time}` : ""} · {b.status}
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDayDetail(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;