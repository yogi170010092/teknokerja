import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useLaptopProducts } from "@/hooks/useLaptopProducts";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Camera,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface FormData {
  name: string;
  whatsapp: string;
  email: string;
  address: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  notes: string;
  socialMedia: string;
  emergencyContact: string;
}

interface FormErrors {
  name?: string;
  whatsapp?: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  dates?: string;
  emergencyContact?: string;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const BookingForm = () => {
  const { id } = useParams();
  const { data: laptops, isLoading: laptopsLoading } = useLaptopProducts();
  const laptop = laptops?.find((p) => p.dbId === id);

  // Helper: format Date jadi "YYYY-MM-DD" dan "HH:MM" sesuai waktu lokal
  const toDateInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const toTimeInput = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getDefaultFormDates = () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return {
      startDate: toDateInput(now),
      startTime: toTimeInput(now),
      endDate: toDateInput(in24h),
      endTime: toTimeInput(in24h),
    };
  };

  const [form, setForm] = useState<FormData>({
    name: "",
    whatsapp: "",
    email: "",
    address: "",
    ...getDefaultFormDates(),
    notes: "",
    socialMedia: "",
    emergencyContact: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(true);

  // --- Hitung durasi & total harga otomatis ---
  const { days, totalPrice, priceLabel } = useMemo(() => {
    if (!form.startDate || !form.endDate || !laptop) {
      return { days: 0, totalPrice: 0, priceLabel: "" };
    }
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffDays =
      Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

    if (diffDays <= 0) return { days: 0, totalPrice: 0, priceLabel: "" };

    let total = 0;
    let label = "";

    if (diffDays >= 30 && laptop.priceMonthly) {
      const months = Math.ceil(diffDays / 30);
      total = laptop.priceMonthly * months;
      label = `${months}x tarif bulanan`;
    } else if (diffDays >= 7 && laptop.priceWeekly) {
      const weeks = Math.ceil(diffDays / 7);
      total = laptop.priceWeekly * weeks;
      label = `${weeks}x tarif mingguan`;
    } else if (laptop.priceDaily) {
      total = laptop.priceDaily * diffDays;
      label = `${diffDays}x tarif harian`;
    }

    return { days: diffDays, totalPrice: total, priceLabel: label };
  }, [form.startDate, form.endDate, laptop]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";

    if (!form.whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp wajib diisi";
    } else if (!/^[0-9+\s-]{8,15}$/.test(form.whatsapp.trim())) {
      newErrors.whatsapp = "Nomor WhatsApp tidak valid";
    }

    if (!form.address.trim()) newErrors.address = "Alamat wajib diisi";

    if (!form.emergencyContact.trim()) {
      newErrors.emergencyContact = "Nomor kontak darurat wajib diisi";
    } else if (!/^[0-9+\s-]{8,15}$/.test(form.emergencyContact.trim())) {
      newErrors.emergencyContact = "Nomor kontak darurat tidak valid";
    }

    if (!form.startDate) newErrors.startDate = "Tanggal mulai wajib diisi";
    if (!form.endDate) newErrors.endDate = "Tanggal selesai wajib diisi";

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      newErrors.dates = "Tanggal selesai harus setelah tanggal mulai";
    }

    if (
      form.startDate &&
      form.endDate &&
      form.startDate === form.endDate &&
      form.startTime &&
      form.endTime &&
      form.endTime <= form.startTime
    ) {
      newErrors.dates = "Jam selesai harus setelah jam mulai";
    }

    const today = new Date().toISOString().split("T")[0];
    if (form.startDate && form.startDate < today) {
      newErrors.startDate = "Tanggal mulai tidak boleh di masa lalu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Cek bentrok jadwal ke Supabase ---
  const checkScheduleConflict = async (): Promise<boolean> => {
    if (!laptop?.dbId) return false;

    setIsCheckingConflict(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, start_date, end_date, status")
        .eq("laptop_id", laptop.dbId)
        .not("status", "in", "(cancelled)")
        .lte("start_date", form.endDate)
        .gte("end_date", form.startDate);

      if (error) throw error;
      return (data?.length ?? 0) > 0;
    } catch (err) {
      console.error("Conflict check error:", err);
      return false; // kalau gagal cek, jangan blok user, biar admin yang follow up manual
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!laptop) {
      toast.error("Data laptop tidak ditemukan");
      return;
    }

    if (laptop.status !== "ready") {
      toast.error("Maaf, laptop ini sedang tidak tersedia");
      return;
    }

    if (!validate()) {
      toast.error("Mohon lengkapi data yang wajib diisi");
      return;
    }

    setIsSubmitting(true);

    const hasConflict = await checkScheduleConflict();
    if (hasConflict) {
      setErrors((prev) => ({
        ...prev,
        dates:
          "Laptop sudah dibooking pada rentang tanggal ini, silakan pilih tanggal lain",
      }));
      toast.error("Jadwal bentrok dengan booking lain");
      setIsSubmitting(false);
      return;
    }

    const combinedNotes = [
      `Alamat: ${form.address.trim()}`,
      `Durasi: ${days} hari (${priceLabel})`,
      `Estimasi total: ${formatRp(totalPrice)}`,
      form.notes.trim() ? `Catatan: ${form.notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const { error } = await supabase.from("bookings").insert({
        customer_name: form.name.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim() || null,
        laptop_id: laptop.dbId,
        laptop_name: laptop.name,
        quantity: 1,
        start_date: form.startDate,
        start_time: form.startTime || null,
        end_date: form.endDate,
        end_time: form.endTime || null,
        notes: combinedNotes,
        social_media: form.socialMedia.trim() || null,
        emergency_contact: form.emergencyContact.trim(),
        status: "pending",
        source_page: window.location.pathname,
      });

      if (error) throw error;

      const waMessage = [
        `Halo TeknoKerja, saya baru saja booking laptop:`,
        `Laptop: ${laptop.name}`,
        `Nama: ${form.name.trim()}`,
        `Mulai: ${form.startDate} jam ${form.startTime}`,
        `Selesai: ${form.endDate} jam ${form.endTime} (${days} hari)`,
        `Estimasi total: ${formatRp(totalPrice)}`,
        `Alamat: ${form.address.trim()}`,
        `Kontak Darurat: ${form.emergencyContact.trim()}`,
        form.socialMedia.trim()
          ? `Sosial Media: ${form.socialMedia.trim()}`
          : null,
        `Mohon konfirmasi ya, terima kasih!`,
      ]
        .filter(Boolean)
        .join("\n");

      const waUrl = buildWhatsAppUrl(waMessage);

      toast.success("Booking berhasil dikirim! Mengarahkan ke WhatsApp...");
      setTimeout(() => {
        window.location.href = waUrl;
      }, 800);
    } catch (err) {
      console.error("Booking submit error:", err);
      toast.error("Gagal mengirim booking, coba lagi ya");
      setIsSubmitting(false);
    }
  };

  if (laptopsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-2xl py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Memuat data laptop...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!laptop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-2xl py-20 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-headline mb-2">
            Laptop tidak ditemukan
          </h1>
          <p className="text-muted-foreground mb-6">
            Produk yang kamu cari mungkin sudah tidak tersedia.
          </p>
          <Link to="/laptops" className="btn-whatsapp inline-flex px-6 py-3">
            Lihat Semua Laptop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isUnavailable = laptop.status !== "ready";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl py-12">
        <h1 className="text-3xl font-bold mb-2 text-headline">
          Book Your Laptop
        </h1>

        <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 mb-8">
          <img
            src={laptop.image}
            alt={laptop.name}
            className="w-20 h-20 object-contain rounded-lg bg-muted/30"
          />
          <div>
            <p className="font-semibold text-headline">{laptop.name}</p>
            <p className="text-sm text-muted-foreground">{laptop.brand}</p>
            <p className="text-sm font-bold text-primary mt-1">
              {laptop.priceDaily ? formatRp(laptop.priceDaily) : "—"}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                /hari
              </span>
            </p>
          </div>
        </div>

        {isUnavailable && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm font-medium px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Laptop ini sedang tidak tersedia ({laptop.condition}). Silakan pilih
            laptop lain.
          </div>
        )}

        <fieldset disabled={isUnavailable} className="disabled:opacity-50">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nama kamu"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                placeholder="08xxxxxxxxxx"
                className={errors.whatsapp ? "border-destructive" : ""}
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive mt-1">
                  {errors.whatsapp}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email (opsional)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@contoh.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Mulai Sewa *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className={errors.startDate ? "border-destructive" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="startTime">Jam Mulai *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">Selesai Sewa *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className={errors.endDate ? "border-destructive" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endDate}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="endTime">Jam Selesai *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                />
              </div>
            </div>
            {errors.dates && (
              <p className="text-sm text-destructive -mt-3">{errors.dates}</p>
            )}

            {days > 0 && totalPrice > 0 && (
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm text-headline">
                  <span className="font-semibold">{days} hari</span> (
                  {priceLabel}) — Estimasi total:{" "}
                  <span className="font-bold text-primary">
                    {formatRp(totalPrice)}
                  </span>
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="address">Alamat Pengantaran *</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Alamat lengkap (hotel/villa/coworking space)"
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="socialMedia">
                Link Sosial Media Aktif (opsional)
              </Label>
              <Input
                id="socialMedia"
                value={form.socialMedia}
                onChange={(e) => handleChange("socialMedia", e.target.value)}
                placeholder="Instagram / Facebook / LinkedIn (link atau username)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contoh: instagram.com/namakamu
              </p>
            </div>

            <div>
              <Label htmlFor="emergencyContact">
                Nomor Kontak Darurat (Keluarga/Kerabat) *
              </Label>
              <Input
                id="emergencyContact"
                value={form.emergencyContact}
                onChange={(e) =>
                  handleChange("emergencyContact", e.target.value)
                }
                placeholder="08xxxxxxxxxx"
                className={errors.emergencyContact ? "border-destructive" : ""}
              />
              {errors.emergencyContact && (
                <p className="text-sm text-destructive mt-1">
                  {errors.emergencyContact}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Catatan Tambahan (opsional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Ada permintaan khusus?"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isCheckingConflict}
              className="w-full"
            >
              {isSubmitting || isCheckingConflict ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isCheckingConflict ? "Mengecek jadwal..." : "Mengirim..."}
                </>
              ) : (
                "Kirim & Lanjut ke WhatsApp"
              )}
            </Button>
          </form>
        </fieldset>
      </main>

      <Footer />

      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Sebelum Lanjut Booking
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground -mt-2">
            Biar unit laptopnya langsung kami amankan untuk Kakak, setelah isi
            form ini nanti admin kami akan follow-up via WhatsApp untuk minta:
          </p>

          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-headline">Foto KTP</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Untuk mengisi surat perjanjian sewa. KTP asli mohon dibawa
                  saat pengambilan unit.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-headline">
                  Dokumentasi Serah Terima
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Saat pengambilan unit di toko, akan ada foto Kakak bersama
                  laptopnya.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Tenang, ini cuma info awal ya Kak — nggak perlu upload apapun
            sekarang. Tinggal lanjutkan isi form di bawah 👇
          </p>

          <p className="text-xs text-muted-foreground">
            🔒 Kami menjamin kerahasiaan data KTP Anda sesuai dengan kebijakan
            privasi yang berlaku dan hanya digunakan untuk kebutuhan
            administrasi sewa.
          </p>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => setShowTermsDialog(false)}
            >
              Saya Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingForm;
