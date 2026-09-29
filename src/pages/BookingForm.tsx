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
// ASUMSI: sesuaikan path & nama hook dengan LanguageContext.tsx kamu
import { useLanguage } from "@/i18n/LanguageContext";
import type { Locale, TranslationKey } from "@/i18n/translations";

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

// Error disimpan sebagai KEY terjemahan (bukan teks), supaya ikut berganti
// kalau user mengubah bahasa setelah error muncul.
type FormErrors = Partial<
  Record<
    | "name"
    | "idNumber"
    | "whatsapp"
    | "socialMedia"
    | "address"
    | "stayType"
    | "stayAddress"
    | "startDate"
    | "endDate"
    | "dates"
    | "emergencyContactName"
    | "emergencyContactRelation"
    | "emergencyContact"
    | "emergencyContactAddress"
    | "emergencyConsent",
    TranslationKey
  >
>;

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

// value = yang disimpan ke database (tetap Bahasa Indonesia biar konsisten buat admin)
// labelKey = yang ditampilkan ke user sesuai bahasa
const relationOptions: { value: string; labelKey: TranslationKey }[] = [
  { value: "Orang Tua", labelKey: "bookingForm.relation.parent" },
  { value: "Pasangan", labelKey: "bookingForm.relation.spouse" },
  { value: "Saudara", labelKey: "bookingForm.relation.sibling" },
  { value: "Teman", labelKey: "bookingForm.relation.friend" },
  { value: "Rekan Kerja", labelKey: "bookingForm.relation.colleague" },
  { value: "Lainnya", labelKey: "bookingForm.relation.other" },
];

// Label tarif versi Indonesia, khusus untuk catatan & pesan WhatsApp ke admin
const rateLabelID = { monthly: "bulanan", weekly: "mingguan", daily: "harian" } as const;

const bookingWhatsAppCopy: Record<Locale, {
  greeting: string;
  intro: string;
  laptop: string;
  name: string;
  identityNumber: string;
  occupation: string;
  rentalStart: string;
  rentalEnd: string;
  days: string;
  estimatedTotal: string;
  homeAddress: string;
  rentalAccommodation: string;
  roomUnit: string;
  emergencyContact: string;
  address: string;
  socialMedia: string;
  confirmation: string;
  notProvided: string;
}> = {
  id: {
    greeting: "Halo TeknoKerja 👋",
    intro: "saya baru saja booking laptop lewat website:",
    laptop: "Laptop", name: "Nama", identityNumber: "No. Identitas",
    occupation: "Pekerjaan/Perusahaan", rentalStart: "Mulai Sewa", rentalEnd: "Selesai Sewa",
    days: "hari", estimatedTotal: "Estimasi Total", homeAddress: "Alamat Domisili",
    rentalAccommodation: "Tempat Tinggal Selama Sewa", roomUnit: "Kamar/Unit",
    emergencyContact: "Kontak Darurat", address: "Alamat", socialMedia: "Sosial Media",
    confirmation: "Mohon konfirmasi ya, terima kasih! 🙏", notProvided: "-",
  },
  en: {
    greeting: "Hello TeknoKerja 👋",
    intro: "I have just booked a laptop through the website:",
    laptop: "Laptop", name: "Name", identityNumber: "ID Number",
    occupation: "Occupation/Company", rentalStart: "Rental Start", rentalEnd: "Rental End",
    days: "days", estimatedTotal: "Estimated Total", homeAddress: "Home Address",
    rentalAccommodation: "Accommodation During Rental", roomUnit: "Room/Unit",
    emergencyContact: "Emergency Contact", address: "Address", socialMedia: "Social Media",
    confirmation: "Please confirm my booking. Thank you! 🙏", notProvided: "-",
  },
  ru: {
    greeting: "Здравствуйте, TeknoKerja 👋",
    intro: "Я только что забронировал(а) ноутбук через сайт:",
    laptop: "Ноутбук", name: "Имя", identityNumber: "Номер документа",
    occupation: "Работа/Компания", rentalStart: "Начало аренды", rentalEnd: "Окончание аренды",
    days: "дней", estimatedTotal: "Ориентировочная сумма", homeAddress: "Домашний адрес",
    rentalAccommodation: "Место проживания во время аренды", roomUnit: "Номер комнаты/апартамента",
    emergencyContact: "Экстренный контакт", address: "Адрес", socialMedia: "Социальные сети",
    confirmation: "Пожалуйста, подтвердите бронирование. Спасибо! 🙏", notProvided: "-",
  },
  zh: {
    greeting: "您好，TeknoKerja 👋",
    intro: "我刚刚通过网站预订了一台笔记本电脑：",
    laptop: "笔记本电脑", name: "姓名", identityNumber: "证件号码",
    occupation: "职业/公司", rentalStart: "租赁开始", rentalEnd: "租赁结束",
    days: "天", estimatedTotal: "预估总价", homeAddress: "住址",
    rentalAccommodation: "租赁期间住宿地点", roomUnit: "房间/单元号",
    emergencyContact: "紧急联系人", address: "地址", socialMedia: "社交媒体",
    confirmation: "请确认我的预订，谢谢！🙏", notProvided: "-",
  },
};

const dateLocale: Record<Locale, string> = {
  id: "id-ID",
  en: "en-GB",
  ru: "ru-RU",
  zh: "zh-CN",
};

// Ganti {placeholder} di teks terjemahan
const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

const BookingForm = () => {
  const { id } = useParams();
  const { t, locale } = useLanguage();
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

  const { days, totalPrice, rate } = useMemo(() => {
    if (!form.startDate || !form.endDate || !laptop) {
      return { days: 0, totalPrice: 0, rate: null };
    }
    const start = new Date(`${form.startDate}T${form.startTime || "00:00"}`);
    const end = new Date(`${form.endDate}T${form.endTime || "00:00"}`);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);

    if (diffDays <= 0) return { days: 0, totalPrice: 0, rate: null };

    let total = 0;
    let r: { kind: "monthly" | "weekly" | "daily"; n: number } | null = null;

    if (diffDays >= 30 && laptop.priceMonthly) {
      const months = Math.ceil(diffDays / 30);
      total = laptop.priceMonthly * months;
      r = { kind: "monthly", n: months };
    } else if (diffDays >= 7 && laptop.priceWeekly) {
      const weeks = Math.ceil(diffDays / 7);
      total = laptop.priceWeekly * weeks;
      r = { kind: "weekly", n: weeks };
    } else if (laptop.priceDaily) {
      total = laptop.priceDaily * diffDays;
      r = { kind: "daily", n: diffDays };
    }

    return { days: diffDays, totalPrice: total, rate: r };
  }, [form.startDate, form.startTime, form.endDate, form.endTime, laptop]);

  // Label tarif buat ditampilkan ke user (ikut bahasa)
  const priceLabel = rate
    ? fill(t(`bookingForm.price.${rate.kind}` as TranslationKey), { n: rate.n })
    : "";
  // Label tarif Indonesia dipakai untuk catatan internal admin.
  const priceLabelID = rate ? `${rate.n}x tarif ${rateLabelID[rate.kind]}` : "";

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = "bookingForm.err.name";
    if (!form.idNumber.trim()) newErrors.idNumber = "bookingForm.err.idNumber";

    if (!form.whatsapp.trim()) {
      newErrors.whatsapp = "bookingForm.err.whatsappRequired";
    } else if (!/^[0-9+\s-]{8,16}$/.test(form.whatsapp.trim())) {
      newErrors.whatsapp = "bookingForm.err.whatsappInvalid";
    }

    if (!form.socialMedia.trim()) newErrors.socialMedia = "bookingForm.err.social";
    if (!form.address.trim()) newErrors.address = "bookingForm.err.address";
    if (!form.stayType.trim()) newErrors.stayType = "bookingForm.err.stayType";
    if (!form.stayAddress.trim()) newErrors.stayAddress = "bookingForm.err.stayAddress";

    if (!form.emergencyContactName.trim()) newErrors.emergencyContactName = "bookingForm.err.ecName";
    if (!form.emergencyContactRelation.trim()) newErrors.emergencyContactRelation = "bookingForm.err.ecRelation";

    if (!form.emergencyContact.trim()) {
      newErrors.emergencyContact = "bookingForm.err.ecPhoneRequired";
    } else if (!/^[0-9+\s-]{8,16}$/.test(form.emergencyContact.trim())) {
      newErrors.emergencyContact = "bookingForm.err.ecPhoneInvalid";
    }

    if (!form.emergencyContactAddress.trim()) newErrors.emergencyContactAddress = "bookingForm.err.ecAddress";
    if (!form.emergencyConsent) newErrors.emergencyConsent = "bookingForm.err.consent";

    if (!form.startDate) newErrors.startDate = "bookingForm.err.startDate";
    if (!form.endDate) newErrors.endDate = "bookingForm.err.endDate";

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      newErrors.dates = "bookingForm.err.dateOrder";
    }
    if (
      form.startDate && form.endDate && form.startDate === form.endDate &&
      form.startTime && form.endTime && form.endTime <= form.startTime
    ) {
      newErrors.dates = "bookingForm.err.timeOrder";
    }

    const today = new Date().toISOString().split("T")[0];
    if (form.startDate && form.startDate < today) {
      newErrors.startDate = "bookingForm.err.startPast";
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
      toast.error(t("bookingForm.toast.noLaptop"));
      return;
    }
    if (laptop.status !== "ready") {
      toast.error(t("bookingForm.toast.unavailable"));
      return;
    }
    if (!validate()) {
      toast.error(t("bookingForm.toast.fillRequired"));
      return;
    }

    setIsSubmitting(true);

    const hasConflict = await checkScheduleConflict();
    if (hasConflict) {
      setErrors((prev) => ({ ...prev, dates: "bookingForm.err.conflict" }));
      toast.error(t("bookingForm.toast.conflict"));
      setIsSubmitting(false);
      return;
    }

    // Catatan internal tetap Indonesia agar konsisten di dashboard admin.
    const combinedNotes = [
      `No. Identitas: ${form.idNumber.trim()}`,
      `Pekerjaan/Perusahaan: ${form.occupation.trim() || "-"}`,
      `No. Kamar/Unit: ${form.roomNumber.trim() || "-"}`,
      form.checkinDate ? `Check-in: ${form.checkinDate}` : null,
      form.checkoutDate ? `Check-out: ${form.checkoutDate}` : null,
      `Durasi: ${days} hari (${priceLabelID})`,
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
        locale, // bahasa yang dipakai customer, tampil di halaman admin
        source_page: window.location.pathname,
      });

      if (error) throw error;

      // Langsung kunci laptop begitu booking masuk, biar tidak keduluan
      // orang lain checkout laptop yang sama.
      await supabase.from("laptops").update({ status: "rented" }).eq("id", laptop.dbId);

      const formatDate = (dateStr: string) =>
        new Date(`${dateStr}T00:00:00`).toLocaleDateString(dateLocale[locale], {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

      const copy = bookingWhatsAppCopy[locale];
      const relation = relationOptions.find((option) => option.value === form.emergencyContactRelation);
      const relationshipLabel = relation ? t(relation.labelKey) : form.emergencyContactRelation.trim();

      const waMessage = [
        `${copy.greeting}, ${copy.intro}`,
        ``,
        `\u{1F4BB} *${copy.laptop}*`,
        laptop.name,
        ``,
        `\u{1F64B} *${copy.name}*`,
        form.name.trim(),
        ``,
        `\u{1F194} *${copy.identityNumber}*`,
        form.idNumber.trim(),
        ``,
        `\u{1F3E2} *${copy.occupation}*`,
        form.occupation.trim() || copy.notProvided,
        ``,
        `\u{1F7E2} *${copy.rentalStart}*`,
        `${formatDate(form.startDate)}, ${form.startTime}`,
        ``,
        `\u{1F534} *${copy.rentalEnd}*`,
        `${formatDate(form.endDate)}, ${form.endTime} (${days} ${copy.days})`,
        ``,
        `\u{1F4B0} *${copy.estimatedTotal}*`,
        formatRp(totalPrice),
        ``,
        `\u{1F4CD} *${copy.homeAddress}*`,
        form.address.trim(),
        ``,
        `\u{1F3E8} *${copy.rentalAccommodation}*`,
        `${form.stayType.trim()} - ${form.stayAddress.trim()}${form.roomNumber.trim() ? ` (${copy.roomUnit}: ${form.roomNumber.trim()})` : ""}`,
        ``,
        `\u{1F4DE} *${copy.emergencyContact}*`,
        `${form.emergencyContactName.trim()} (${relationshipLabel}) - ${form.emergencyContact.trim()}`,
        `${copy.address}: ${form.emergencyContactAddress.trim()}`,
        ``,
        `\u{1F4F1} *${copy.socialMedia}*`,
        form.socialMedia.trim(),
        ``,
        copy.confirmation,
      ].join("\n");

      const waUrl = buildWhatsAppUrl(waMessage);

      toast.success(t("bookingForm.toast.success"));
      setTimeout(() => {
        window.location.href = waUrl;
      }, 800);
    } catch (err) {
      console.error("Booking submit error:", err);
      toast.error(t("bookingForm.toast.failed"));
      setIsSubmitting(false);
    }
  };

  if (laptopsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-2xl py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">{t("bookingForm.loading")}</p>
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
          <h1 className="text-2xl font-bold text-headline mb-2">{t("bookingForm.notFoundTitle")}</h1>
          <p className="text-muted-foreground mb-6">{t("bookingForm.notFoundDesc")}</p>
          <Link to="/laptops" className="btn-whatsapp inline-flex px-6 py-3">
            {t("bookingForm.viewAll")}
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
        <h1 className="text-3xl font-bold mb-2 text-headline">{t("bookingForm.title")}</h1>

        <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 mb-8">
          <img src={laptop.image} alt={laptop.name} className="w-20 h-20 object-contain rounded-lg bg-muted/30" />
          <div>
            <p className="font-semibold text-headline">{laptop.name}</p>
            <p className="text-sm text-muted-foreground">{laptop.brand}</p>
            <p className="text-sm font-bold text-primary mt-1">
              {laptop.priceDaily ? formatRp(laptop.priceDaily) : "—"}
              <span className="text-xs font-normal text-muted-foreground"> {t("bookingForm.perDay")}</span>
            </p>
          </div>
        </div>

        {isUnavailable && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm font-medium px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {fill(t("bookingForm.unavailable"), { condition: laptop.condition })}
          </div>
        )}

        <fieldset disabled={isUnavailable} className="disabled:opacity-50">
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* ===== DATA PENYEWA ===== */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-headline border-b border-border pb-2">{t("bookingForm.renterData")}</h2>

              <div>
                <Label htmlFor="name">{t("bookingForm.name")} *</Label>
                <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)}
                  placeholder={t("bookingForm.namePlaceholder")} className={errors.name ? "border-destructive" : ""} />
                {errors.name && <p className="text-sm text-destructive mt-1">{t(errors.name)}</p>}
              </div>

              <div>
                <Label htmlFor="idNumber">{t("bookingForm.idNumber")} *</Label>
                <Input id="idNumber" value={form.idNumber} onChange={(e) => handleChange("idNumber", e.target.value)}
                  placeholder={t("bookingForm.idNumberPlaceholder")} className={errors.idNumber ? "border-destructive" : ""} />
                {errors.idNumber && <p className="text-sm text-destructive mt-1">{t(errors.idNumber)}</p>}
              </div>

              <div>
                <Label htmlFor="whatsapp">{t("bookingForm.whatsapp")} *</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="" className={errors.whatsapp ? "border-destructive" : ""} />
                {errors.whatsapp && <p className="text-sm text-destructive mt-1">{t(errors.whatsapp)}</p>}
              </div>

              <div>
                <Label htmlFor="email">{t("bookingForm.email")}</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)}
                  placeholder={t("bookingForm.emailPlaceholder")} />
              </div>

              <div>
                <Label htmlFor="socialMedia">{t("bookingForm.social")} *</Label>
                <Input id="socialMedia" value={form.socialMedia} onChange={(e) => handleChange("socialMedia", e.target.value)}
                  placeholder={t("bookingForm.socialPlaceholder")} className={errors.socialMedia ? "border-destructive" : ""} />
                {errors.socialMedia && <p className="text-sm text-destructive mt-1">{t(errors.socialMedia)}</p>}
              </div>

              <div>
                <Label htmlFor="address">{t("bookingForm.address")} *</Label>
                <Textarea id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)}
                  placeholder={t("bookingForm.addressPlaceholder")} className={errors.address ? "border-destructive" : ""} />
                {errors.address && <p className="text-sm text-destructive mt-1">{t(errors.address)}</p>}
              </div>

              <div>
                <Label htmlFor="stayType">{t("bookingForm.stayType")} *</Label>
                <Input id="stayType" value={form.stayType} onChange={(e) => handleChange("stayType", e.target.value)}
                  placeholder={t("bookingForm.stayTypePlaceholder")} className={errors.stayType ? "border-destructive" : ""} />
                {errors.stayType && <p className="text-sm text-destructive mt-1">{t(errors.stayType)}</p>}
              </div>

              <div>
                <Label htmlFor="stayAddress">{t("bookingForm.stayAddress")} *</Label>
                <Textarea id="stayAddress" value={form.stayAddress} onChange={(e) => handleChange("stayAddress", e.target.value)}
                  placeholder={t("bookingForm.stayAddressPlaceholder")} className={errors.stayAddress ? "border-destructive" : ""} />
                {errors.stayAddress && <p className="text-sm text-destructive mt-1">{t(errors.stayAddress)}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkinDate">{t("bookingForm.checkinDate")}</Label>
                  <Input id="checkinDate" type="date" value={form.checkinDate} onChange={(e) => handleChange("checkinDate", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="checkoutDate">{t("bookingForm.checkoutDate")}</Label>
                  <Input id="checkoutDate" type="date" value={form.checkoutDate} onChange={(e) => handleChange("checkoutDate", e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="roomNumber">{t("bookingForm.roomNumber")}</Label>
                <Input id="roomNumber" value={form.roomNumber} onChange={(e) => handleChange("roomNumber", e.target.value)}
                  placeholder={t("bookingForm.roomNumberPlaceholder")} />
              </div>

              <div>
                <Label htmlFor="occupation">{t("bookingForm.occupation")}</Label>
                <Input id="occupation" value={form.occupation} onChange={(e) => handleChange("occupation", e.target.value)}
                  placeholder={t("bookingForm.occupationPlaceholder")} />
              </div>
            </div>

            {/* ===== JADWAL SEWA ===== */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-headline border-b border-border pb-2">{t("bookingForm.scheduleTitle")}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">{t("bookingForm.startDate")} *</Label>
                  <Input id="startDate" type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)}
                    className={errors.startDate ? "border-destructive" : ""} />
                  {errors.startDate && <p className="text-sm text-destructive mt-1">{t(errors.startDate)}</p>}
                </div>
                <div>
                  <Label htmlFor="startTime">{t("bookingForm.startTime")} *</Label>
                  <Input id="startTime" type="time" value={form.startTime} onChange={(e) => handleChange("startTime", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">{t("bookingForm.endDate")} *</Label>
                  <Input id="endDate" type="date" value={form.endDate} onChange={(e) => handleChange("endDate", e.target.value)}
                    className={errors.endDate ? "border-destructive" : ""} />
                  {errors.endDate && <p className="text-sm text-destructive mt-1">{t(errors.endDate)}</p>}
                </div>
                <div>
                  <Label htmlFor="endTime">{t("bookingForm.endTime")} *</Label>
                  <Input id="endTime" type="time" value={form.endTime} onChange={(e) => handleChange("endTime", e.target.value)} />
                </div>
              </div>
              {errors.dates && <p className="text-sm text-destructive -mt-3">{t(errors.dates)}</p>}

              {days > 0 && totalPrice > 0 && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm text-headline">
                    <span className="font-semibold">{days} {t("bookingForm.daysUnit")}</span> ({priceLabel}) — {t("bookingForm.estimateTotal")}:{" "}
                    <span className="font-bold text-primary">{formatRp(totalPrice)}</span>
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="notes">{t("bookingForm.notes")}</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder={t("bookingForm.notesPlaceholder")} />
              </div>
            </div>

            {/* ===== KONTAK DARURAT ===== */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-headline border-b border-border pb-2">{t("bookingForm.emergencyTitle")}</h2>

              <div>
                <Label htmlFor="emergencyContactName">{t("bookingForm.ecName")} *</Label>
                <Input id="emergencyContactName" value={form.emergencyContactName}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                  placeholder={t("bookingForm.ecNamePlaceholder")} className={errors.emergencyContactName ? "border-destructive" : ""} />
                {errors.emergencyContactName && <p className="text-sm text-destructive mt-1">{t(errors.emergencyContactName)}</p>}
              </div>

              <div>
                <Label htmlFor="emergencyContactRelation">{t("bookingForm.ecRelation")} *</Label>
                <select
                  id="emergencyContactRelation"
                  value={form.emergencyContactRelation}
                  onChange={(e) => handleChange("emergencyContactRelation", e.target.value)}
                  className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ${errors.emergencyContactRelation ? "border-destructive" : "border-input"}`}
                >
                  <option value="">{t("bookingForm.ecRelationPlaceholder")}</option>
                  {relationOptions.map((r) => (
                    <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
                  ))}
                </select>
                {errors.emergencyContactRelation && <p className="text-sm text-destructive mt-1">{t(errors.emergencyContactRelation)}</p>}
              </div>

              <div>
                <Label htmlFor="emergencyContact">{t("bookingForm.ecPhone")} *</Label>
                <Input id="emergencyContact" value={form.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  placeholder="+62812xxxxxxx" className={errors.emergencyContact ? "border-destructive" : ""} />
                {errors.emergencyContact && <p className="text-sm text-destructive mt-1">{t(errors.emergencyContact)}</p>}
              </div>

              <div>
                <Label htmlFor="emergencyContactAddress">{t("bookingForm.ecAddress")} *</Label>
                <Textarea id="emergencyContactAddress" value={form.emergencyContactAddress}
                  onChange={(e) => handleChange("emergencyContactAddress", e.target.value)}
                  placeholder={t("bookingForm.ecAddressPlaceholder")} className={errors.emergencyContactAddress ? "border-destructive" : ""} />
                {errors.emergencyContactAddress && <p className="text-sm text-destructive mt-1">{t(errors.emergencyContactAddress)}</p>}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("bookingForm.consentBefore")}
                  <strong>{t("bookingForm.consentBold")}</strong>
                  {t("bookingForm.consentAfter")}
                </p>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="emergencyConsent"
                    checked={form.emergencyConsent}
                    onCheckedChange={(checked) => handleChange("emergencyConsent", checked === true)}
                  />
                  <Label htmlFor="emergencyConsent" className="text-xs font-normal leading-relaxed cursor-pointer">
                    {t("bookingForm.consentLabel")} *
                  </Label>
                </div>
                {errors.emergencyConsent && <p className="text-sm text-destructive">{t(errors.emergencyConsent)}</p>}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting || isCheckingConflict} className="w-full">
              {isSubmitting || isCheckingConflict ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isCheckingConflict ? t("bookingForm.checking") : t("bookingForm.sending")}
                </>
              ) : (
                t("bookingForm.submit")
              )}
            </Button>
          </form>
        </fieldset>
      </main>

      <Footer />

      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{t("bookingModal.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            {t("bookingModal.intro")}
          </p>
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-headline">{t("bookingModal.idTitle")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("bookingModal.idDesc")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-headline">{t("bookingModal.docTitle")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("bookingModal.docDesc")}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            {t("bookingModal.note")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("bookingModal.privacy")}
          </p>
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowTermsDialog(false)}>
              {t("bookingModal.button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingForm;
