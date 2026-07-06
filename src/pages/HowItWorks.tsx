import { MessageCircle, Laptop, ShieldCheck, Truck, FileCheck, MapPin, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEOHead, BreadcrumbNav, BreadcrumbSchema } from "@/components/seo";
import FAQSchema from "@/components/seo/FAQSchema";
import RelatedHelp from "@/components/seo/RelatedHelp";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { buildDefaultWhatsAppUrl } from "@/lib/whatsapp";

const HowItWorks = () => {
  const { t, locale, lp } = useLanguage();
  const whatsappUrl = buildDefaultWhatsAppUrl(locale);

  const steps = [
    { icon: MessageCircle, titleKey: "how.step1.title" as const, descKey: "how.step1.desc" as const },
    { icon: Laptop, titleKey: "how.step2.title" as const, descKey: "how.step2.desc" as const },
    { icon: ShieldCheck, titleKey: "how.step3.title" as const, descKey: "how.step3.desc" as const },
    { icon: Truck, titleKey: "how.step4.title" as const, descKey: "how.step4.desc" as const },
  ];

  const requirements = [
    { icon: FileCheck, key: "how.req1" as const },
    { icon: CreditCard, key: "how.req2" as const },
    { icon: MapPin, key: "how.req3" as const },
    { icon: ShieldCheck, key: "how.req4" as const },
  ];

  // FAQ for AI/Google rich results
  const faqItems = [
    { question: locale === "en" ? "How long does delivery take?" : "Berapa lama waktu pengantaran?", answer: locale === "en" ? "Most laptops are delivered the same day, often within 2–4 hours of confirming your order via WhatsApp." : "Sebagian besar laptop diantar di hari yang sama, biasanya dalam 2–4 jam setelah konfirmasi via WhatsApp." },
    { question: locale === "en" ? "What documents do I need as a tourist?" : "Dokumen apa yang dibutuhkan sebagai wisatawan?", answer: locale === "en" ? "A valid passport and a refundable deposit. That's it — no Indonesian residency required." : "Paspor yang masih berlaku dan deposit yang dapat dikembalikan. Tidak perlu status residen Indonesia." },
    { question: locale === "en" ? "Is the deposit refundable?" : "Apakah deposit bisa dikembalikan?", answer: locale === "en" ? "Yes — 100% refundable when the laptop is returned in good condition." : "Ya — 100% dapat dikembalikan saat laptop dikembalikan dalam kondisi baik." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={locale === "en" ? "How Laptop Rental Works in Bali — TeknoKerja" : "Cara Sewa Laptop di Bali — TeknoKerja"}
        description={locale === "en" ? "4 simple steps to rent a laptop in Bali as a tourist or digital nomad. WhatsApp booking, fast delivery to Canggu, Seminyak, Ubud, Kuta." : "4 langkah mudah sewa laptop di Bali untuk wisatawan & digital nomad. Pesan via WhatsApp, antar cepat ke Canggu, Seminyak, Ubud, Kuta."}
        canonical="https://teknokerja.com/how-it-works"
        keywords="how to rent laptop bali, laptop rental process bali, rent macbook bali tourist"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://teknokerja.com/" },
        { name: "How It Works", url: "https://teknokerja.com/how-it-works" },
      ]} />
      <FAQSchema items={faqItems} />

      <Header />

      <main>
        <div className="container pt-6">
          <BreadcrumbNav items={[{ label: t("nav.howItWorks") }]} />
        </div>

        {/* Hero */}
        <section className="container py-10 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-headline mb-4 max-w-3xl mx-auto leading-tight">
            {t("how.title")}
          </h1>
          <p className="text-lg text-body max-w-2xl mx-auto">{t("how.sub")}</p>
        </section>

        {/* Steps */}
        <section className="container pb-12 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(({ icon: Icon, titleKey, descKey }, i) => (
              <div key={titleKey} className="relative bg-card rounded-2xl border border-border p-6 hover-lift">
                <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-headline mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-body leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="container pb-12 md:pb-16">
          <div className="bg-secondary rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-headline mb-6 text-center">
              {t("how.requirements")}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {requirements.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border">
                  <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-body">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="container pb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-headline mb-3">
              {locale === "en" ? "Ready to get started?" : "Siap memulai?"}
            </h2>
            <p className="text-body mb-6 max-w-xl mx-auto">
              {locale === "en" ? "Chat with our team on WhatsApp — we usually respond in under 5 minutes." : "Chat tim kami via WhatsApp — biasanya kami balas dalam 5 menit."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { location: "how_cta", locale, service_category: "general" })}
                className="btn-whatsapp text-base px-8 py-4"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("hero.cta1")}
              </a>
              <Link to={lp("/faq")} className="btn-cta text-base px-8 py-4">
                {locale === "en" ? "Read FAQ" : "Baca FAQ"}
              </Link>
            </div>
          </div>
        </section>

        <RelatedHelp location="how" />
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
