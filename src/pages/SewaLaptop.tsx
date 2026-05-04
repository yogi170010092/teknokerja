import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEOHead, ServiceSchema, BreadcrumbNav, BreadcrumbSchema } from "@/components/seo";

import { MessageCircle, Laptop, Building, Users, Calendar, CheckCircle, Clock, Shield, Headphones } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import RelatedHelp from "@/components/seo/RelatedHelp";

const WHATSAPP_NUMBER = "6283891088084";

type ServiceCategory = "rental_work" | "rental_office" | "rental_event" | "rental_project" | "consultation" | "general";

const useCases: { icon: typeof Laptop; titleKey: TranslationKey; descKey: TranslationKey; message: string; category: ServiceCategory }[] = [
  {
    icon: Laptop,
    titleKey: "sewa.useWork",
    descKey: "sewa.useWorkDesc",
    message: "Halo, saya butuh sewa laptop untuk kerja/WFH",
    category: "rental_work",
  },
  {
    icon: Building,
    titleKey: "sewa.useOffice",
    descKey: "sewa.useOfficeDesc",
    message: "Halo, saya butuh sewa laptop untuk kantor/UMKM",
    category: "rental_office",
  },
  {
    icon: Users,
    titleKey: "sewa.useEvent",
    descKey: "sewa.useEventDesc",
    message: "Halo, saya butuh sewa laptop untuk event/seminar",
    category: "rental_event",
  },
  {
    icon: Calendar,
    titleKey: "sewa.useProject",
    descKey: "sewa.useProjectDesc",
    message: "Halo, saya butuh sewa laptop untuk project sementara",
    category: "rental_project",
  },
];

const benefits: { icon: typeof CheckCircle; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: CheckCircle, titleKey: "sewa.benefitQuality", descKey: "sewa.benefitQualityDesc" },
  { icon: Clock, titleKey: "sewa.benefitFlexible", descKey: "sewa.benefitFlexibleDesc" },
  { icon: Shield, titleKey: "sewa.benefitWarranty", descKey: "sewa.benefitWarrantyDesc" },
  { icon: Headphones, titleKey: "sewa.benefitSupport", descKey: "sewa.benefitSupportDesc" },
];

const SewaLaptop = () => {
  const { t, locale, lp } = useLanguage();
  const getWhatsappUrl = (message: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const canonical = `https://teknokerja.com${lp("/sewa-laptop")}`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.sewa.title")}
        description={t("seo.sewa.desc")}
        canonical={canonical}
        keywords="sewa laptop bali, rental laptop denpasar, laptop rental bali, rent macbook bali"
      />
      <ServiceSchema
        name="Jasa Sewa Laptop Bali"
        description="Layanan sewa laptop harian, mingguan, dan bulanan di Bali untuk kebutuhan kerja, WFH, bisnis, kantor, event, dan seminar."
        serviceType="Sewa Laptop"
        areaServed="Bali, Indonesia"
      />
      <BreadcrumbSchema
        items={[
          { name: "Beranda", url: "https://teknokerja.com/" },
          { name: "Sewa Laptop", url: "https://teknokerja.com/sewa-laptop" },
        ]}
      />
      <Header />
      <BreadcrumbNav items={[{ label: t("nav.rental") }]} />

      <main>
        {/* Hero Section */}
        <section className="pt-8 pb-12 md:pt-10 md:pb-16 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in">
                {t("sewa.badge")}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in leading-tight text-headline">
                {t("sewa.headline")}
              </h1>
              <p className="text-lg md:text-xl text-body mb-8 animate-slide-up">
                {t("sewa.sub")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                <a
                  href={getWhatsappUrl("Halo, saya tertarik sewa laptop TeknoKerja. Bisa info lebih lanjut?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { location: "sewa_hero", locale, service_category: "general" })}
                  className="btn-whatsapp text-lg px-8 py-4 hover-glow"
                >
                  <MessageCircle className="w-6 h-6 mr-2" />
                  {t("sewa.ctaRent")}
                </a>
                <a
                  href={getWhatsappUrl("Halo, saya mau konsultasi dulu tentang kebutuhan laptop")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { location: "sewa_hero_consult", locale, service_category: "consultation" })}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:-translate-y-0.5"
                >
                  {t("sewa.ctaConsult")}
                </a>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {t("sewa.areaNote")}
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-headline mb-3">
                {t("sewa.forWho")}
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                {t("sewa.forWhoSub")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all group hover-lift"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <useCase.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-headline mb-2">{t(useCase.titleKey)}</h3>
                  <p className="text-sm text-body mb-4">{t(useCase.descKey)}</p>
                  <a
                    href={getWhatsappUrl(useCase.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("whatsapp_click", { location: "sewa_usecase", locale, service_category: useCase.category })}
                    className="text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t("sewa.askWa")}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-headline mb-3">
                {t("sewa.whyTitle")}
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                {t("sewa.whySub")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-xl border border-border p-6 text-center hover-lift"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-headline mb-2">{t(benefit.titleKey)}</h3>
                  <p className="text-sm text-body">{t(benefit.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container">
            <div className="bg-card rounded-2xl p-8 md:p-12 text-center border border-border shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-headline">
                {t("sewa.readyTitle")}
              </h2>
              <p className="text-lg text-body mb-8 max-w-2xl mx-auto">
                {t("sewa.readyDesc")}
              </p>
              <a
                href={getWhatsappUrl("Halo TeknoKerja, saya mau sewa laptop. Bisa info harga dan ketersediaan?")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { location: "sewa_final_cta", locale, service_category: "general" })}
                className="btn-whatsapp inline-flex text-lg px-8 py-4"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                {t("sewa.chatWa")}
              </a>
              <p className="text-sm text-muted-foreground mt-6">
                📞 0838-9108-8084 • 📧 iklansatu7@gmail.com
              </p>
            </div>
          </div>
        </section>

        {/* Related help / FAQ cross-links — boosts session time and crawl depth */}
        <RelatedHelp location="sewa" />
      </main>

      <Footer />
    </div>
  );
};

export default SewaLaptop;
