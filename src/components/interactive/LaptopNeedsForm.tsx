import { useEffect, useState } from "react";
import { Laptop, Building, Users, MessageCircle, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { buildWhatsAppUrl, getDefaultWhatsAppMessage } from "@/lib/whatsapp";
import { createBooking, logLead } from "@/lib/leads";
import { notifyAdmin } from "@/lib/notifyAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LaptopOption { id: string; name: string; brand: string | null; price_daily: number | null; }

type NeedType = "kerja" | "kantor" | "event" | null;
type Duration = "1-3-hari" | "1-minggu" | "1-bulan" | null;

const needOptions: { id: NeedType & string; labelKey: TranslationKey; icon: typeof Laptop; descKey: TranslationKey }[] = [
  { id: "kerja", labelKey: "form.needWork", icon: Laptop, descKey: "form.needWorkDesc" },
  { id: "kantor", labelKey: "form.needOffice", icon: Building, descKey: "form.needOfficeDesc" },
  { id: "event", labelKey: "form.needEvent", icon: Users, descKey: "form.needEventDesc" },
];

const durationOptions: { id: Duration & string; labelKey: TranslationKey; descKey: TranslationKey }[] = [
  { id: "1-3-hari", labelKey: "form.durDaily", descKey: "form.durDailyDesc" },
  { id: "1-minggu", labelKey: "form.durWeekly", descKey: "form.durWeeklyDesc" },
  { id: "1-bulan", labelKey: "form.durMonthly", descKey: "form.durMonthlyDesc" },
];

const LaptopNeedsForm = () => {
  const { t, locale } = useLanguage();
  const [step, setStep] = useState(1);
  const [need, setNeed] = useState<NeedType>(null);
  const [duration, setDuration] = useState<Duration>(null);
  const [units, setUnits] = useState(1);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [laptops, setLaptops] = useState<LaptopOption[]>([]);
  const [laptopId, setLaptopId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    supabase
      .from("laptops")
      .select("id,name,brand,price_daily")
      .in("status", ["ready", "rented"])
      .order("sort_order")
      .then(({ data }) => setLaptops(data ?? []));
  }, []);

  const selectedLaptop = laptops.find((l) => l.id === laptopId);
  const totalSteps = 4;

  const generateWhatsAppMessage = () => {
    const needLabel = needOptions.find(n => n.id === need);
    const durationLabel = durationOptions.find(d => d.id === duration);
    const laptopLine = selectedLaptop ? `\n🖥️ ${selectedLaptop.brand ?? ""} ${selectedLaptop.name}` : "";
    const dateLine = startDate ? `\n📅 ${startDate}${endDate ? ` → ${endDate}` : ""}` : "";
    return `${getDefaultWhatsAppMessage(locale)}\n\n👤 ${name}\n📱 ${wa}\n📋 ${needLabel ? t(needLabel.labelKey) : ""}\n⏱️ ${durationLabel ? t(durationLabel.labelKey) : ""}\n💻 ${units} unit${laptopLine}${dateLine}`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const category = need === "kerja" ? "rental_work" : need === "kantor" ? "rental_office" : need === "event" ? "rental_event" : "general";
    setSubmitting(true);
    try {
      const notes = `Need: ${need} · Duration: ${duration} · Units: ${units}`;
      await createBooking({
        customer_name: name,
        whatsapp: wa,
        quantity: units,
        notes,
        locale,
        laptop_id: selectedLaptop?.id ?? null,
        laptop_name: selectedLaptop ? `${selectedLaptop.brand ?? ""} ${selectedLaptop.name}`.trim() : null,
        start_date: startDate || null,
        end_date: endDate || startDate || null,
      });
      logLead({ event_type: "booking_submitted", location: "laptop_needs_form", service_category: category, locale });
      trackEvent("form_submit", { form: "laptop_needs", need, duration, units, service_category: category, locale });
      trackEvent("whatsapp_click", { location: "laptop_needs_form", service_category: category, units, duration, locale });
      notifyAdmin("booking", {
        Nama: name,
        WhatsApp: wa,
        Kebutuhan: need,
        Durasi: duration,
        Unit: units,
        Laptop: selectedLaptop ? `${selectedLaptop.brand ?? ""} ${selectedLaptop.name}`.trim() : "—",
        Mulai: startDate || "—",
        Selesai: endDate || "—",
        Locale: locale,
        Halaman: typeof window !== "undefined" ? window.location.pathname : "—",
      });
      window.open(buildWhatsAppUrl(generateWhatsAppMessage()), "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return need !== null;
    if (step === 2) return duration !== null;
    if (step === 3) return units > 0;
    if (step === 4) return name.trim().length >= 2 && wa.trim().length >= 6;
    return false;
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold text-headline mb-2 text-center">{t("form.checkNeeds")}</h3>
      <p className="text-body text-center mb-6">{t("form.checkSub")}</p>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${s < step ? "bg-primary text-primary-foreground" : s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-secondary text-muted-foreground"}`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < totalSteps && <div className={`flex-1 h-1 rounded ${s < step ? "bg-primary" : "bg-secondary"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm font-medium text-headline mb-4">{t("form.q1")}</p>
          {needOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button key={option.id} onClick={() => setNeed(option.id as NeedType)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${need === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${need === option.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}><Icon className="w-6 h-6" /></div>
                <div className="text-left"><p className="font-semibold text-headline">{t(option.labelKey)}</p><p className="text-sm text-body">{t(option.descKey)}</p></div>
                {need === option.id && <Check className="w-5 h-5 text-primary ml-auto" />}
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm font-medium text-headline mb-4">{t("form.q2")}</p>
          {durationOptions.map((option) => (
            <button key={option.id} onClick={() => setDuration(option.id as Duration)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${duration === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
              <div className="text-left"><p className="font-semibold text-headline">{t(option.labelKey)}</p><p className="text-sm text-body">{t(option.descKey)}</p></div>
              {duration === option.id && <Check className="w-5 h-5 text-primary" />}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-sm font-medium text-headline mb-4">{t("form.q3")}</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setUnits(Math.max(1, units - 1))} className="w-12 h-12 rounded-lg bg-secondary text-headline font-bold text-xl hover:bg-primary hover:text-primary-foreground transition-colors">-</button>
            <div className="w-24 text-center"><span className="text-4xl font-bold text-primary">{units}</span><p className="text-sm text-body mt-1">{t("form.unit")}</p></div>
            <button onClick={() => setUnits(units + 1)} className="w-12 h-12 rounded-lg bg-secondary text-headline font-bold text-xl hover:bg-primary hover:text-primary-foreground transition-colors">+</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-medium text-headline mb-2">{t("form.contactStep")}</p>
          <div>
            <label className="block text-sm text-body mb-1">{t("form.yourName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-headline focus:border-primary outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm text-body mb-1">{t("form.yourWa")}</label>
            <input
              type="tel"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              maxLength={32}
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-headline focus:border-primary outline-none"
              placeholder="+62…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-body mb-1">Mulai (opsional)</label>
              <input type="date" value={startDate} min={new Date().toISOString().slice(0,10)} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-3 rounded-lg border-2 border-border bg-background text-headline focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm text-body mb-1">Selesai (opsional)</label>
              <input type="date" value={endDate} min={startDate || new Date().toISOString().slice(0,10)} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-3 rounded-lg border-2 border-border bg-background text-headline focus:border-primary outline-none" />
            </div>
          </div>
          {laptops.length > 0 && (
            <div>
              <label className="block text-sm text-body mb-1">Pilih Laptop (opsional)</label>
              <select
                value={laptopId}
                onChange={(e) => setLaptopId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-headline focus:border-primary outline-none"
              >
                <option value="">— Biar tim kami pilihkan —</option>
                {laptops.map((l) => (
                  <option key={l.id} value={l.id}>
                    {[l.brand, l.name].filter(Boolean).join(" ")}
                    {l.price_daily ? ` · Rp ${l.price_daily.toLocaleString("id-ID")}/hari` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="bg-secondary rounded-xl p-4">
            <p className="text-sm font-medium text-headline mb-2">{t("form.summary")}</p>
            <div className="text-sm text-body space-y-1">
              <p>📋 {needOptions.find(n => n.id === need) ? t(needOptions.find(n => n.id === need)!.labelKey) : ""}</p>
              <p>⏱️ {durationOptions.find(d => d.id === duration) ? t(durationOptions.find(d => d.id === duration)!.labelKey) : ""}</p>
              <p>💻 {units} {t("form.unitLaptop")}</p>
              {selectedLaptop && <p>🖥️ {[selectedLaptop.brand, selectedLaptop.name].filter(Boolean).join(" ")}</p>}
              {startDate && <p>📅 {startDate}{endDate ? ` → ${endDate}` : ""}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-border text-headline font-semibold hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4" />{t("btn.back")}
          </button>
        )}
        {step < totalSteps ? (
          <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${canProceed() ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}>
            {t("btn.next")}<ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!canProceed() || submitting} className={`flex-1 btn-whatsapp text-base py-3 ${(!canProceed() || submitting) ? "opacity-60 cursor-not-allowed" : ""}`}>
            <MessageCircle className="w-5 h-5 mr-2" />{submitting ? t("form.savingLead") : t("form.sendWa")}
          </button>
        )}
      </div>
    </div>
  );
};

export default LaptopNeedsForm;
