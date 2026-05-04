import { useState } from "react";
import { Laptop, Building, Users, MessageCircle, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const WHATSAPP_NUMBER = "6283891088084";

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
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [need, setNeed] = useState<NeedType>(null);
  const [duration, setDuration] = useState<Duration>(null);
  const [units, setUnits] = useState(1);

  const generateWhatsAppMessage = () => {
    const needLabel = needOptions.find(n => n.id === need);
    const durationLabel = durationOptions.find(d => d.id === duration);
    return `Halo TeknoKerja, saya ingin sewa laptop:\n\n📋 Kebutuhan: ${needLabel ? t(needLabel.labelKey) : ""}\n⏱️ Durasi: ${durationLabel ? t(durationLabel.labelKey) : ""}\n💻 Jumlah: ${units} unit\n\nMohon info ketersediaan dan harganya. Terima kasih!`;
  };

  const handleSubmit = () => {
    const category = need === "kerja" ? "rental_work" : need === "kantor" ? "rental_office" : need === "event" ? "rental_event" : "general";
    trackEvent("form_submit", { form: "laptop_needs", need, duration, units, service_category: category });
    trackEvent("whatsapp_click", { location: "laptop_needs_form", service_category: category, units, duration });
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const canProceed = () => {
    if (step === 1) return need !== null;
    if (step === 2) return duration !== null;
    if (step === 3) return units > 0;
    return false;
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold text-headline mb-2 text-center">{t("form.checkNeeds")}</h3>
      <p className="text-body text-center mb-6">{t("form.checkSub")}</p>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${s < step ? "bg-primary text-primary-foreground" : s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-secondary text-muted-foreground"}`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? "bg-primary" : "bg-secondary"}`} />}
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
          <div className="bg-secondary rounded-xl p-4 mt-6">
            <p className="text-sm font-medium text-headline mb-2">{t("form.summary")}</p>
            <div className="text-sm text-body space-y-1">
              <p>📋 {needOptions.find(n => n.id === need) ? t(needOptions.find(n => n.id === need)!.labelKey) : ""}</p>
              <p>⏱️ {durationOptions.find(d => d.id === duration) ? t(durationOptions.find(d => d.id === duration)!.labelKey) : ""}</p>
              <p>💻 {units} {t("form.unitLaptop")}</p>
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
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${canProceed() ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}>
            {t("btn.next")}<ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} className="flex-1 btn-whatsapp text-base py-3">
            <MessageCircle className="w-5 h-5 mr-2" />{t("form.sendWa")}
          </button>
        )}
      </div>
    </div>
  );
};

export default LaptopNeedsForm;
