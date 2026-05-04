import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEOHead, BreadcrumbNav, BreadcrumbSchema, FAQSchema } from "@/components/seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, UserCheck, CreditCard, Laptop, AlertTriangle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const sections = [
  {
    id: "identitas",
    icon: UserCheck,
    titleKey: "terms.sectionA" as const,
    items: ["terms.a1" as const, "terms.a2" as const],
  },
  {
    id: "pembayaran",
    icon: CreditCard,
    titleKey: "terms.sectionB" as const,
    items: ["terms.b1" as const, "terms.b2" as const],
  },
  {
    id: "penggunaan",
    icon: Laptop,
    titleKey: "terms.sectionC" as const,
    items: ["terms.c1" as const, "terms.c2" as const, "terms.c3" as const],
  },
  {
    id: "kerusakan",
    icon: AlertTriangle,
    titleKey: "terms.sectionD" as const,
    items: ["terms.d1" as const, "terms.d2" as const],
  },
  {
    id: "pengembalian",
    icon: RotateCcw,
    titleKey: "terms.sectionE" as const,
    items: ["terms.e1" as const, "terms.e2" as const],
  },
];

const SyaratKetentuan = () => {
  const { t, lp } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.terms.title")}
        description={t("seo.terms.desc")}
        canonical={`https://teknokerja.com${lp("/syarat-ketentuan")}`}
        keywords="syarat ketentuan sewa laptop, terms conditions laptop rental bali"
      />
      <BreadcrumbSchema
        items={[
          { name: "Beranda", url: "https://teknokerja.com/" },
          { name: "Syarat & Ketentuan", url: "https://teknokerja.com/syarat-ketentuan" },
        ]}
      />
      <FAQSchema
        items={sections.map((section) => ({
          question: t(section.titleKey as TranslationKey),
          answer: section.items.map((itemKey) => t(itemKey as TranslationKey)).join(" "),
        }))}
      />
      <Header />
      <BreadcrumbNav items={[{ label: t("nav.terms") }]} />

      <main>
        <section className="bg-background py-16 md:py-24 border-b border-border">
          <div className="container text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-headline animate-fade-in">
              {t("terms.headline")}
            </h1>
            <p className="text-lg md:text-xl text-body max-w-2xl mx-auto animate-slide-up">
              {t("terms.sub")}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <Accordion type="multiple" defaultValue={["identitas"]} className="space-y-4">
                {sections.map((section) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="bg-card rounded-xl border border-border px-6 data-[state=open]:border-primary/30 transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <section.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-headline text-base md:text-lg">
                          {t(section.titleKey)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3 pl-[52px]">
                        {section.items.map((itemKey, i) => (
                          <li key={i} className="flex items-start gap-2 text-body">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <span>{t(itemKey)}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-10 bg-card rounded-xl border border-border p-6 text-center">
                <p className="text-body text-sm">
                  {t("terms.footer")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SyaratKetentuan;
