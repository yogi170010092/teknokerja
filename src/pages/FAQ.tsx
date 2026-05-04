import { MessageCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEOHead, BreadcrumbNav, BreadcrumbSchema } from "@/components/seo";
import FAQSchema from "@/components/seo/FAQSchema";
import RelatedHelp from "@/components/seo/RelatedHelp";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

const WHATSAPP_NUMBER = "6283891088084";
const WHATSAPP_MESSAGE = "Hi TeknoKerja, I have a question about laptop rental in Bali.";

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const FAQPage = () => {
  const { t, locale } = useLanguage();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  const items = FAQ_KEYS.map((n) => ({
    question: t(`faq.q${n}` as any),
    answer: t(`faq.a${n}` as any),
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={locale === "en" ? "Laptop Rental Bali FAQ — TeknoKerja" : "FAQ Sewa Laptop Bali — TeknoKerja"}
        description={locale === "en" ? "Answers to common questions about renting a laptop in Bali: pricing, deposit, passport, MacBook, delivery to Canggu, Seminyak, Ubud, Kuta." : "Jawaban pertanyaan umum sewa laptop di Bali: harga, deposit, paspor, MacBook, pengantaran ke Canggu, Seminyak, Ubud, Kuta."}
        canonical={locale === "en" ? "https://teknokerja.com/faq" : `https://teknokerja.com/${locale}/faq`}
        keywords="faq laptop rental bali, rent laptop bali questions, macbook rental bali faq"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://teknokerja.com/" },
        { name: "FAQ", url: "https://teknokerja.com/faq" },
      ]} />
      <FAQSchema items={items} />

      <Header />

      <main>
        <div className="container pt-6">
          <BreadcrumbNav items={[{ label: "FAQ" }]} />
        </div>

        <section className="container py-10 md:py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-headline mb-4 max-w-3xl mx-auto leading-tight">
            {t("faq.title")}
          </h1>
          <p className="text-lg text-body max-w-2xl mx-auto">{t("faq.sub")}</p>
        </section>

        <section className="container pb-12 max-w-3xl">
          <Accordion
            type="single"
            collapsible
            className="space-y-3"
            onValueChange={(v) => v && trackEvent("faq_open", { item: v, locale })}
          >
            {items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card rounded-2xl border border-border px-5 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-semibold text-headline hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-body leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="container pb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-10 text-center max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-2">
              {t("faq.cta")}
            </h2>
            <p className="text-body mb-5">{t("faq.ctaSub")}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_click", { location: "faq_cta", locale, service_category: "support" })}
              className="btn-whatsapp text-base px-8 py-4 inline-flex"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {t("btn.whatsapp")}
            </a>
          </div>
        </section>

        {/* Related help / Articles cross-links */}
        <RelatedHelp location="faq" />
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
