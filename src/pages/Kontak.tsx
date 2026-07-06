import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleMapsSection from "@/components/home/GoogleMapsSection";
import { SEOHead, BreadcrumbNav, BreadcrumbSchema } from "@/components/seo";
import { MessageCircle, Mail, Phone, MapPin, Send, Clock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { buildWhatsAppUrl, WHATSAPP_NUMBER, getDefaultWhatsAppMessage } from "@/lib/whatsapp";
import { notifyAdmin } from "@/lib/notifyAdmin";

const EMAIL = "iklansatu7@gmail.com";
const PHONE = "0838-9108-8084";
const ADDRESS = "Jl. Tukad Yeh Biu No.29, Sesetan, Denpasar Selatan, Kota Denpasar, Bali 80225";

const laptopOptionKeys: TranslationKey[] = [
  "laptop.standard", "laptop.business", "laptop.highend", "laptop.gaming", "laptop.macbook", "laptop.unsure",
];
const durationOptionKeys: TranslationKey[] = [
  "dur.1to3", "dur.1week", "dur.2weeks", "dur.1month", "dur.3months", "dur.6months",
];

const Kontak = () => {
  const { t, locale, lp } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    whatsapp: "",
    jenisLaptop: "",
    durasi: "",
    tanggalMulai: "",
    lokasi: "",
    catatan: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getWhatsappUrl = (message: string) => buildWhatsAppUrl(message);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama.trim()) newErrors.nama = t("kontak.errName");
    if (!formData.whatsapp.trim()) newErrors.whatsapp = t("kontak.errWa");
    else if (!/^[0-9+\-\s]{10,15}$/.test(formData.whatsapp.replace(/\s/g, ''))) newErrors.whatsapp = t("kontak.errWaFormat");
    if (!formData.jenisLaptop) newErrors.jenisLaptop = t("kontak.errLaptop");
    if (!formData.durasi) newErrors.durasi = t("kontak.errDuration");
    if (!formData.tanggalMulai) newErrors.tanggalMulai = t("kontak.errStart");
    if (!formData.lokasi.trim()) newErrors.lokasi = t("kontak.errLocation");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: t("kontak.formIncomplete"), description: t("kontak.fillRequired"), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    trackEvent("form_submit", { form_type: "contact_whatsapp", jenis_laptop: formData.jenisLaptop, durasi: formData.durasi });
    notifyAdmin("contact", {
      Nama: formData.nama,
      WhatsApp: formData.whatsapp,
      "Jenis Laptop": formData.jenisLaptop,
      Durasi: formData.durasi,
      Mulai: formData.tanggalMulai,
      Lokasi: formData.lokasi,
      Catatan: formData.catatan || "—",
      Locale: locale,
    });
    const message = `${getDefaultWhatsAppMessage(locale)}\n\nNama: ${formData.nama}\nWhatsApp: ${formData.whatsapp}\nJenis Laptop: ${formData.jenisLaptop}\nDurasi: ${formData.durasi}\nMulai: ${formData.tanggalMulai}\nLokasi: ${formData.lokasi}\nCatatan: ${formData.catatan || "-"}`;
    toast({ title: t("kontak.connecting"), description: t("kontak.dataSent") });
    setTimeout(() => {
      setIsSubmitting(false);
      const waUrl = getWhatsappUrl(message);
      const newWindow = window.open(waUrl, "_blank");
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") window.location.href = waUrl;
      setFormData({ nama: "", whatsapp: "", jenisLaptop: "", durasi: "", tanggalMulai: "", lokasi: "", catatan: "" });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const inputClass = (fieldName: string) => `
    w-full px-4 py-3 rounded-lg border bg-background text-foreground 
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
    transition-all duration-200
    ${errors[fieldName] ? "border-destructive ring-2 ring-destructive/20" : "border-border"}
  `;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.kontak.title")}
        description={t("seo.kontak.desc")}
        canonical={`https://teknokerja.com${lp("/kontak")}`}
        keywords="kontak teknokerja, contact teknokerja, sewa laptop bali"
      />
      <BreadcrumbSchema items={[{ name: "Beranda", url: "https://teknokerja.com/" }, { name: "Kontak", url: "https://teknokerja.com/kontak" }]} />
      <Header />
      <BreadcrumbNav items={[{ label: t("nav.contact") }]} />

      <main>
        <section className="bg-background py-16 md:py-20 border-b border-border">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-headline animate-fade-in">{t("kontak.headline")}</h1>
            <p className="text-lg text-body max-w-xl mx-auto animate-slide-up">{t("kontak.sub")}</p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border shadow-lg">
                  <h2 className="font-bold text-lg mb-2 text-headline">{t("kontak.fastest")}</h2>
                  <p className="text-sm text-body mb-4">{t("kontak.fastestDesc")}</p>
                  <a href={getWhatsappUrl(getDefaultWhatsAppMessage(locale))} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full justify-center" onClick={() => trackEvent("whatsapp_click", { location: "contact_sidebar", locale, service_category: "support" })}>
                    <MessageCircle className="w-5 h-5 mr-2" />{t("btn.whatsapp")}
                  </a>
                  <p className="text-xs text-caption mt-3 text-center">{PHONE}</p>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                  <h2 className="font-bold text-headline">{t("kontak.info")}</h2>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="text-sm font-semibold text-headline">{t("kontak.waPhone")}</h3><a href={`tel:+${WHATSAPP_NUMBER}`} className="text-sm text-body hover:text-primary transition-colors">{PHONE}</a></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="text-sm font-semibold text-headline">Email</h3><a href={`mailto:${EMAIL}`} className="text-sm text-body hover:text-primary transition-colors">{EMAIL}</a></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="text-sm font-semibold text-headline">{t("kontak.address")}</h3><p className="text-sm text-body">{ADDRESS}</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="text-sm font-semibold text-headline">{t("kontak.hours")}</h3><p className="text-sm text-body">{t("kontak.hoursMon")}<br />{t("kontak.hoursSat")}</p></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h2 className="font-bold text-headline mb-3">{t("kontak.ourServices")}</h2>
                  <ul className="space-y-2 text-sm text-body">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="font-medium">{t("kontak.svcRental")}</span></li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />{t("kontak.svcEvent")}</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />{t("kontak.svcIT")}</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />{t("kontak.svcConsult")}</li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-[#25D366]" /></div>
                    <h2 className="text-xl font-bold text-headline">{t("kontak.formTitle")}</h2>
                  </div>
                  <p className="text-body mb-6">{t("kontak.formDesc")}</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-headline mb-1.5">{t("kontak.fieldName")} <span className="text-destructive">*</span></label>
                        <input type="text" id="nama" name="nama" value={formData.nama} onChange={handleChange} className={inputClass("nama")} placeholder={t("kontak.fieldNamePh")} />
                        {errors.nama && <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.nama}</p>}
                      </div>
                      <div>
                        <label htmlFor="whatsapp" className="block text-sm font-medium text-headline mb-1.5">{t("kontak.fieldWa")} <span className="text-destructive">*</span></label>
                        <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputClass("whatsapp")} placeholder="08xxxxxxxxxx" />
                        {errors.whatsapp && <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.whatsapp}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="jenisLaptop" className="block text-sm font-medium text-headline mb-1.5">{t("kontak.fieldLaptop")} <span className="text-destructive">*</span></label>
                        <select id="jenisLaptop" name="jenisLaptop" value={formData.jenisLaptop} onChange={handleChange} className={inputClass("jenisLaptop")}>
                          <option value="">{t("kontak.fieldLaptopPh")}</option>
                          {laptopOptionKeys.map((key) => <option key={key} value={t(key)}>{t(key)}</option>)}
                        </select>
                        {errors.jenisLaptop && <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.jenisLaptop}</p>}
                      </div>
                      <div>
                        <label htmlFor="durasi" className="block text-sm font-medium text-headline mb-1.5">{t("kontak.fieldDuration")} <span className="text-destructive">*</span></label>
                        <select id="durasi" name="durasi" value={formData.durasi} onChange={handleChange} className={inputClass("durasi")}>
                          <option value="">{t("kontak.fieldDurationPh")}</option>
                          {durationOptionKeys.map((key) => <option key={key} value={t(key)}>{t(key)}</option>)}
                        </select>
                        {errors.durasi && <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.durasi}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="tanggalMulai" className="block text-sm font-medium text-headline mb-1.5">{t("kontak.fieldStart")} <span className="text-destructive">*</span></label>
                        <input type="date" id="tanggalMulai" name="tanggalMulai" value={formData.tanggalMulai} onChange={handleChange} min={new Date().toISOString().split("T")[0]} className={inputClass("tanggalMulai")} />
                        {errors.tanggalMulai && <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.tanggalMulai}</p>}
                      </div>
                      <div>
                        <label htmlFor="lokasi" className="block text-sm font-medium text-headline mb-1.5">{t("kontak.fieldLocation")} <span className="text-destructive">*</span></label>
                        <input type="text" id="lokasi" name="lokasi" value={formData.lokasi} onChange={handleChange} className={inputClass("lokasi")} placeholder={t("kontak.fieldLocationPh")} />
                        {errors.lokasi && <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.lokasi}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="catatan" className="block text-sm font-medium text-headline mb-1.5">{t("kontak.fieldNotes")}</label>
                      <textarea id="catatan" name="catatan" value={formData.catatan} onChange={handleChange} rows={4} className={`${inputClass("catatan")} resize-none`} placeholder={t("kontak.fieldNotesPh")} />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" className="w-full sm:w-auto btn-whatsapp text-base px-8 py-6 relative overflow-hidden" disabled={isSubmitting}>
                        {isSubmitting ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("kontak.connecting")}</>) : (<><Send className="w-5 h-5 mr-2" />{t("btn.sendWhatsapp")}</>)}
                      </Button>
                      <p className="text-xs text-caption mt-3">
                        <CheckCircle className="w-3.5 h-3.5 inline mr-1 text-primary" />{t("kontak.dataNote")}
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <GoogleMapsSection variant="section" />
      </main>

      <Footer />
    </div>
  );
};

export default Kontak;
