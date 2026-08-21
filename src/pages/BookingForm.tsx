import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLaptopProducts } from "@/hooks/useLaptopProducts";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2, FileText, Camera } from "lucide-react";

interface FormData {
  name: string;
  idNumber: string;
  whatsapp: string;
  email: string;
  socialMedia: string;
  address: string;
  stayType: string;
  stayAddress: string;
  checkinDate: string;
  checkoutDate: string;
  roomNumber: string;
  occupation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  notes: string;
  emergencyContactName: string;
  emergencyContact: string; // nomor HP kontak darurat
  emergencyContactRelation: string;
  emergencyContactAddress: string;
  emergencyConsent: boolean;
}

interface FormErrors {
  name?: string;
  idNumber?: string;
  whatsapp?: string;
  socialMedia?: string;
  address?: string;
  stayType?: string;
  stayAddress?: string;
  startDate?: string;
  endDate?: string;
  dates?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContact?: string;
  emergencyContactAddress?: string;
  emergencyConsent?: string;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const relationOptions = ["Orang Tua", "Pasangan", "Saudara", "Teman", "Rekan Kerja", "Lainnya"];

const BookingForm = () => {
  const { id } = useParams();
  const { data: laptops, isLoading: laptopsLoading } = useLaptopProducts();
  const laptop = laptops?.find((p) => p.dbId === id);

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
    idNumber: "",
    whatsapp: "",
    email: "",
    socialMedia: "",
    address: "",
    stayType: "",
    stayAddress: "",
    checkinDate: "",
    checkoutDate: "",
    roomNumber: "",
    occupation: "",
    ...getDefaultFormDates(),
    notes: "",
    emergencyContactName: "",
    emergencyContact: "",
    emergencyContactRelation: "",
    emergencyContactAddress: "",
    emergencyConsent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(true);

  const { days, totalPrice, priceLabel } = useMemo(() => {
    if (!form.startDate || !form.endDate || !laptop) {
      return { days: 0, totalPrice: 0, priceLabel: "" };
    }
    const start = new Date(`${form.startDate}T${form.startTime || "00:00"}`);
    const end = new Date(`${form.endDate}T${form.endTime || "00:00"}`);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);

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
  }, [form.startDate, form.startTime, form.endDate, form.endTime, laptop]);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!form.idNumber.trim()) newErrors.idNumber = "Nomor identitas wajib diisi";

    if (!form.whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp wajib diisi";
    } else if (!/^[0-9+\s-]{8,16}$/.test(form.whatsapp.trim())) {
      newErrors.whatsapp = "Nomor WhatsApp tidak valid";
    }

    if (!form.socialMedia.trim()) newErrors.socialMedia = "Link sosial media wajib diisi";
    if (!form.address.trim()) newErrors.address = "Alamat domisili wajib diisi";
    if (!form.stayType.trim()) newErrors.stayType = "Tempat tinggal selama sewa wajib diisi";
    if (!form.stayAddress.trim()) newErrors.stayAddress = "Alamat tempat tinggal wajib diisi";

    if (!form.emergencyContactName.trim()) newErrors.emergencyContactName = "Nama kontak darurat wajib diisi";
    if (!form.emergencyContactRelation.trim()) newErrors.emergencyContactRelation = "Hubungan wajib dipilih";

    if (!form.emergencyContact.trim()) {
      newErrors.emergencyContact = "Nomor kontak darurat wajib diisi";
    } else if (!/^[0-9+\s-]{8,16}$/.test(form.emergencyContact.trim())) {
      newErrors.emergencyContact = "Nomor kontak darurat tidak valid";
    }

    if (!form.emergencyContactAddress.trim()) newErrors.emergencyContactAddress = "Alamat kontak darurat wajib diisi";
    if (!form.emergencyConsent) newErrors.emergencyConsent = "Persetujuan wajib dicentang";

    if (!form.startDate) newErrors.startDate = "Tanggal mulai wajib diisi";
    if (!form.endDate) newErrors.endDate = "Tanggal selesai wajib diisi";

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      newErrors.dates = "Tanggal selesai harus setelah tanggal mulai";
    }
    if (
      form.startDate && form.endDate && form.startDate === form.endDate &&
      form.startTime && form.endTime && form.endTime <= form.startTime
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
      return false;
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
        dates: "Laptop sudah dibooking pada rentang tanggal ini, silakan pilih tanggal lain",
      }));
      toast.error("Jadwal bentrok dengan booking lain");
      setIsSubmitting(false);
      return;
    }

    const combinedNotes = [
      `No. Identitas: ${form.idNumber.trim()}`,
      `Pekerjaan/Perusahaan: ${form.occupation.trim() || "-"}`,
      `No. Kamar/Unit: ${form.roomNumber.trim() || "-"}`,
      form.checkinDate ? `Check-in: ${form.checkinDate}` : null,
      form.checkoutDate ? `Check-out: ${form.checkoutDate}` : null,
      `Durasi: ${days} hari (${priceLabel})`,
      `Estimasi total: ${formatRp(totalPrice)}`,
      form.notes.trim() ? `Catatan: ${form.notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const { error } = await supabase.from("bookings").insert({
        customer_name: form.name.trim(),
        id_number: form.idNumber.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim() || null,
        social_media: form.socialMedia.trim(),
        laptop_id: laptop.dbId,
        laptop_name: laptop.name,
        quantity: 1,
        start_date: form.startDate,
        start_time: form.startTime || null,
        end_date: form.endDate,
        end_time: form.endTime || null,
        notes: combinedNotes,
        stay_type: form.stayType.trim(),
        stay_address: form.stayAddress.trim(),
        checkin_date: form.checkinDate || null,
        checkout_date: form.checkoutDate || null,
        room_number: form.roomNumber.trim() || null,
        occupation: form.occupation.trim() || null,
        emergency_contact_name: form.emergencyContactName.trim(),
        emergency_contact: form.emergencyContact.trim(),
        emergency_contact_relation: form.emergencyContactRelation.trim(),
        emergency_contact_address: form.emergencyContactAddress.trim(),
        emergency_consent: form.emergencyConsent,
        status: "pending",
        source_page: window.location.pathname,
      });

      if (error) throw error;

      // Langsung kunci laptop begitu booking masuk, biar tidak keduluan
      // orang lain checkout laptop yang sama.
      await supabase.from("laptops").update({ status: "rented" }).eq("id", laptop.dbId);

      const formatDateID = (dateStr: string) =>
        new Date(`${dateStr}T00:00:00`).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

      const waMessage = [
        `Halo TeknoKerja \u{1F44B}, saya baru saja booking laptop lewat website:`,
        ``,
        `\u{1F4BB} *Laptop*`,
        laptop.name,
        ``,
        `\u{1F64B} *Nama*`,
        form.name.trim(),
        ``,
        `\u{1F194} *No. Identitas*`,
        form.idNumber.trim(),
        ``,
        `\u{1F3E2} *Pekerjaan/Perusahaan*`,
        form.occupation.trim() || "-",
        ``,
        `\u{1F7E2} *Mulai Sewa*`,
        `${formatDateID(form.startDate)}, ${form.startTime}`,
        ``,
        `\u{1F534} *Selesai Sewa*`,
        `${formatDateID(form.endDate)}, ${form.endTime} (${days} hari)`,
        ``,
        `\u{1F4B0} *Estimasi Total*`,
        formatRp(totalPrice),
        ``,
        `\u{1F4CD} *Alamat Domisili*`,
        form.address.trim(),
        ``,
        `\u{1F3E8} *Tempat Tinggal Selama Sewa*`,
        `${form.stayType.trim()} - ${form.stayAddress.trim()}${form.roomNumber.trim() ? ` (Kamar/Unit: ${form.roomNumber.trim()})` : ""}`,
        ``,
        `\u{1F4DE} *Kontak Darurat*`,
        `${form.emergencyContactName.trim()} (${form.emergencyContactRelation.trim()}) - ${form.emergencyContact.trim()}`,
        `Alamat: ${form.emergencyContactAddress.trim()}`,
        ``,
        `\u{1F4F1} *Sosial Media*`,
        form.socialMedia.trim(),
        ``,
        `Mohon konfirmasi ya, terima kasih! \u{1F64F}`,
      ].join("\n");

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
          <h1 className="text-2xl font-bold text-headline mb-2">Laptop tidak ditemukan</h1>
          <p className="text-muted-foreground mb-6">Produk yang kamu cari mungkin sudah tidak tersedia.</p>
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
        <h1 className="text-3xl font-bold mb-2 text-headline">Book Your Laptop</h1>

        <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 mb-8">
          <img src={laptop.image} alt={laptop.name} className="w-20 h-20 object-contain rounded-lg bg-muted/30" />
          <div>
            <p className="font-semibold text-headline">{laptop.name}</p>
            <p className="text-sm text-muted-foreground">{laptop.brand}</p>
            <p className="text-sm font-bold text-primary mt-1">
              {laptop.priceDaily ? formatRp(laptop.priceDaily) : "—"}
              <span className="text-xs font-normal text-muted-foreground"> /hari</span>
            </p>
          </div>
        </div>

        {isUnavailable && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm font-medium px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Laptop ini sedang tidak tersedia ({laptop.condition}). Silakan pilih laptop lain.
          </div>
        )}

        <fieldset disabled={isUnavailable} className="disabled:opacity-50">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* ===== DATA PENYEWA ===== */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-headline border-b border-border pb-2">Data Penyewa</h2>

              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nama kamu" className={errors.name ? "border-destructive" : ""} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="idNumber">No. KTP / Paspor / KTM *</Label>
                <Input id="idNumber" value={form.idNumber} onChange={(e) => handleChange("idNumber", e.target.value)}
                  placeholder="Nomor identitas" className={errors.idNumber ? "border-destructive" : ""} />
                {errors.idNumber && <p className="text-sm text-destructive mt-1">{errors.idNumber}</p>}
              </div>

              <div>
                <Label htmlFor="whatsapp">No. HP / WhatsApp *</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="" className={errors.whatsapp ? "border-destructive" : ""} />
                {/* <p className="text-xs text-muted-foreground mt-1">
                  Gunakan format +62 untuk nomor Indonesia, atau +kode negara Anda untuk nomor luar negeri
                </p> */}
                {errors.whatsapp && <p className="text-sm text-destructive mt-1">{errors.whatsapp}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email (opsional)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@contoh.com" />
              </div>

              <div>
                <Label htmlFor="socialMedia">Media Sosial *</Label>
                <Input id="socialMedia" value={form.socialMedia} onChange={(e) => handleChange("socialMedia", e.target.value)}
                  placeholder="Instagram / Facebook / TikTok (link atau username)" className={errors.socialMedia ? "border-destructive" : ""} />
                {errors.socialMedia && <p className="text-sm text-destructive mt-1">{errors.socialMedia}</p>}
              </div>

              <div>
                <Label htmlFor="address">Alamat Domisili *</Label>
                <Textarea id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Alamat KTP / domisili asal" className={errors.address ? "border-destructive" : ""} />
                {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
              </div>

              <div>
                <Label htmlFor="stayType">Tempat Tinggal Selama Masa Sewa *</Label>
                <Input id="stayType" value={form.stayType} onChange={(e) => handleChange("stayType", e.target.value)}
                  placeholder="Nama Hotel / Villa / Apartemen / Rumah / Kos" className={errors.stayType ? "border-destructive" : ""} />
                {errors.stayType && <p className="text-sm text-destructive mt-1">{errors.stayType}</p>}
              </div>

              <div>
                <Label htmlFor="stayAddress">Alamat Tempat Tinggal Selama Masa Sewa *</Label>
                <Textarea id="stayAddress" value={form.stayAddress} onChange={(e) => handleChange("stayAddress", e.target.value)}
                  placeholder="Alamat lengkap tempat tinggal saat ini" className={errors.stayAddress ? "border-destructive" : ""} />
                {errors.stayAddress && <p className="text-sm text-destructive mt-1">{errors.stayAddress}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkinDate">Tanggal Check-in</Label>
                  <Input id="checkinDate" type="date" value={form.checkinDate} onChange={(e) => handleChange("checkinDate", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="checkoutDate">Tanggal Check-out</Label>
                  <Input id="checkoutDate" type="date" value={form.checkoutDate} onChange={(e) => handleChange("checkoutDate", e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="roomNumber">Nomor Kamar / Unit</Label>
                <Input id="roomNumber" value={form.roomNumber} onChange={(e) => handleChange("roomNumber", e.target.value)}
                  placeholder="Contoh: 204 / A3" />
              </div>

              <div>
                <Label htmlFor="occupation">Pekerjaan / Perusahaan</Label>
                <Input id="occupation" value={form.occupation} onChange={(e) => handleChange("occupation", e.target.value)}
                  placeholder="Pekerjaan atau nama perusahaan" />
              </div>
            </div>

            {/* ===== JADWAL SEWA ===== */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-headline border-b border-border pb-2">Jadwal Sewa</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Mulai Sewa *</Label>
                  <Input id="startDate" type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)}
                    className={errors.startDate ? "border-destructive" : ""} />
                  {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <Label htmlFor="startTime">Jam Mulai *</Label>
                  <Input id="startTime" type="time" value={form.startTime} onChange={(e) => handleChange("startTime", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">Selesai Sewa *</Label>
                  <Input id="endDate" type="date" value={form.endDate} onChange={(e) => handleChange("endDate", e.target.value)}
                    className={errors.endDate ? "border-destructive" : ""} />
                  {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate}</p>}
                </div>
                <div>
                  <Label htmlFor="endTime">Jam Selesai *</Label>
                  <Input id="endTime" type="time" value={form.endTime} onChange={(e) => handleChange("endTime", e.target.value)} />
                </div>
              </div>
              {errors.dates && <p className="text-sm text-destructive -mt-3">{errors.dates}</p>}

              {days > 0 && totalPrice > 0 && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm text-headline">
                    <span className="font-semibold">{days} hari</span> ({priceLabel}) — Estimasi total:{" "}
                    <span className="font-bold text-primary">{formatRp(totalPrice)}</span>
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Catatan Tambahan (opsional)</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Ada permintaan khusus?" />
              </div>
            </div>

            {/* ===== KONTAK DARURAT ===== */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-headline border-b border-border pb-2">Kontak Darurat</h2>

              <div>
                <Label htmlFor="emergencyContactName">Nama Lengkap Kontak Darurat *</Label>
                <Input id="emergencyContactName" value={form.emergencyContactName}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                  placeholder="Nama kontak darurat" className={errors.emergencyContactName ? "border-destructive" : ""} />
                {errors.emergencyContactName && <p className="text-sm text-destructive mt-1">{errors.emergencyContactName}</p>}
              </div>

              <div>
                <Label htmlFor="emergencyContactRelation">Hubungan dengan Penyewa *</Label>
                <select
                  id="emergencyContactRelation"
                  value={form.emergencyContactRelation}
                  onChange={(e) => handleChange("emergencyContactRelation", e.target.value)}
                  className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ${errors.emergencyContactRelation ? "border-destructive" : "border-input"}`}
                >
                  <option value="">Pilih hubungan</option>
                  {relationOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.emergencyContactRelation && <p className="text-sm text-destructive mt-1">{errors.emergencyContactRelation}</p>}
              </div>

              <div>
                <Label htmlFor="emergencyContact">No. HP / WhatsApp Kontak Darurat *</Label>
                <Input id="emergencyContact" value={form.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  placeholder="+62812xxxxxxx" className={errors.emergencyContact ? "border-destructive" : ""} />
                {errors.emergencyContact && <p className="text-sm text-destructive mt-1">{errors.emergencyContact}</p>}
              </div>

              <div>
                <Label htmlFor="emergencyContactAddress">Alamat Kontak Darurat *</Label>
                <Textarea id="emergencyContactAddress" value={form.emergencyContactAddress}
                  onChange={(e) => handleChange("emergencyContactAddress", e.target.value)}
                  placeholder="Alamat lengkap kontak darurat" className={errors.emergencyContactAddress ? "border-destructive" : ""} />
                {errors.emergencyContactAddress && <p className="text-sm text-destructive mt-1">{errors.emergencyContactAddress}</p>}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dengan mengisi data kontak darurat di atas, Penyewa menyatakan bahwa kontak tersebut merupakan orang yang memiliki hubungan sebagaimana dinyatakan oleh Penyewa. Penyewa bersedia apabila <strong>PIHAK PERTAMA / TeknoKerja menghubungi kontak darurat tersebut</strong> untuk melakukan konfirmasi identitas, hubungan dengan Penyewa, dan/atau hal yang berkaitan dengan unit laptop yang disewa, khususnya apabila Penyewa tidak dapat dihubungi atau terdapat masalah terkait pengembalian unit. Penyewa menyatakan telah memberikan informasi kepada kontak darurat bahwa pihak TeknoKerja dapat melakukan konfirmasi tersebut.
                </p>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="emergencyConsent"
                    checked={form.emergencyConsent}
                    onCheckedChange={(checked) => handleChange("emergencyConsent", checked === true)}
                  />
                  <Label htmlFor="emergencyConsent" className="text-xs font-normal leading-relaxed cursor-pointer">
                    Saya menyatakan data yang saya berikan benar dan menyetujui ketentuan verifikasi kontak darurat di atas. *
                  </Label>
                </div>
                {errors.emergencyConsent && <p className="text-sm text-destructive">{errors.emergencyConsent}</p>}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting || isCheckingConflict} className="w-full">
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
            <DialogTitle className="text-lg">Sebelum Lanjut Booking</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Biar unit laptopnya langsung kami amankan untuk Kakak, setelah isi form ini nanti admin kami akan follow-up via WhatsApp untuk minta:
          </p>
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-headline">Foto KTP</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Untuk mengisi surat perjanjian sewa. KTP asli mohon dibawa saat pengambilan unit.
                </p>
              </div>

            </div>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-headline">Dokumentasi Penyewa & Laptop</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Saat pengambilan unit, penyewa yang terdaftar wajib hadir dan
                  berfoto bersama laptop yang disewa sebagai dokumentasi serah terima.
                  Pengambilan oleh pihak yang mewakili penyewa tidak diperkenankan.
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Tenang, ini cuma info awal ya Kak — nggak perlu upload apapun sekarang. Tinggal lanjutkan isi form di bawah 👇
          </p>
          <p className="text-xs text-muted-foreground">
            🔒 Kami menjamin kerahasiaan data Anda sesuai dengan kebijakan privasi yang berlaku dan hanya digunakan untuk kebutuhan administrasi sewa.
          </p>
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowTermsDialog(false)}>
              Oke, Lanjut Isi Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingForm;