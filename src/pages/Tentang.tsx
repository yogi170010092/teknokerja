import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEOHead, BreadcrumbNav, BreadcrumbSchema } from "@/components/seo";
import { Award, MapPin, Eye, Zap, Laptop, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Tentang = () => {
  const { t, lp } = useLanguage();

  const reasons = [
    { icon: Laptop, titleKey: "about.reason1" as const, descKey: "about.reason1Desc" as const },
    { icon: MapPin, titleKey: "about.reason2" as const, descKey: "about.reason2Desc" as const },
    { icon: Eye, titleKey: "about.reason3" as const, descKey: "about.reason3Desc" as const },
    { icon: Zap, titleKey: "about.reason4" as const, descKey: "about.reason4Desc" as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.tentang.title")}
        description={t("seo.tentang.desc")}
        canonical={`https://teknokerja.com${lp("/tentang")}`}
        keywords="tentang teknokerja, sewa laptop bali, laptop rental bali, about teknokerja"
      />
      <BreadcrumbSchema
        items={[
          { name: "Beranda", url: "https://teknokerja.com/" },
          { name: "Tentang Kami", url: "https://teknokerja.com/tentang" },
        ]}
      />
      <Header />
      <BreadcrumbNav items={[{ label: t("nav.about") }]} />

      <main>
        {/* Hero */}
        <section className="bg-background py-16 md:py-24 border-b border-border">
          <div className="container text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-headline animate-fade-in">
              {t("about.headline")}
            </h1>
            <p className="text-lg md:text-xl text-body max-w-2xl mx-auto animate-slide-up">
              {t("about.sub")}
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg mb-12">
                <p className="text-body text-lg leading-relaxed">
                  <strong className="text-headline">Tekno Kerja</strong> {t("about.intro1")}
                </p>
                <p className="text-body text-lg leading-relaxed">
                  {t("about.intro2")}
                </p>
              </div>

              {/* Why Choose Us */}
              <h2 className="text-2xl font-bold text-headline mb-6">{t("about.whyChoose")}</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-12">
                {reasons.map((reason, i) => (
                  <div key={i} className="bg-card rounded-xl p-5 border border-border hover-lift">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <reason.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-headline mb-1">{t(reason.titleKey)}</h3>
                        <p className="text-sm text-body">{t(reason.descKey)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="bg-card rounded-xl p-8 border border-border shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-headline">{t("about.moreTitle")}</h2>
                    <p className="text-body mb-4">{t("about.moreDesc")}</p>
                    <a
                      href={lp("/kontak")}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                    >
                      {t("about.contactCta")}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Tentang;
