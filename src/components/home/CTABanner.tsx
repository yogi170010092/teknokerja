import { MessageCircle, Laptop, Users, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

interface CTABannerProps {
  variant?: "default" | "inline" | "sidebar" | "article";
}

const WHATSAPP_NUMBER = "6283891088084";

const CTABanner = ({ variant = "default" }: CTABannerProps) => {
  const { t, lp, locale } = useLanguage();
  const getWhatsappUrl = (message: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const track = (location: string, category: string) =>
    trackEvent("whatsapp_click", { location, service_category: category, locale });

  if (variant === "sidebar") {
    return (
      <div className="bg-card rounded-xl p-6 border border-border shadow-lg hover-lift">
        <h3 className="font-bold text-lg mb-2 text-headline">{t("cta.sidebarTitle")}</h3>
        <p className="text-sm text-body mb-4">{t("cta.sidebarDesc")}</p>
        <a
          href={getWhatsappUrl("Halo, saya tertarik sewa laptop untuk event")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("cta_sidebar", "rental_event")}
          className="btn-whatsapp w-full text-sm hover-glow"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("btn.freeConsult")}
        </a>
      </div>
    );
  }

  if (variant === "inline" || variant === "article") {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20 my-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Laptop className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-headline mb-1">{t("cta.inlineTitle")}</h3>
            <p className="text-sm text-body">{t("cta.inlineDesc")}</p>
          </div>
          <a
            href={getWhatsappUrl("Halo, saya butuh sewa laptop untuk kerja/event di Bali")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("cta_inline", "general")}
            className="btn-whatsapp shrink-0 hover-glow"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("btn.whatsapp")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-headline">{t("cta.title")}</h2>
            <p className="text-body max-w-2xl mx-auto">{t("cta.desc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background rounded-xl p-5 text-center border border-border hover-lift">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Laptop className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-headline">{t("cta.rental")}</h3>
              <p className="text-sm text-body">{t("cta.rentalDesc")}</p>
            </div>
            <div className="bg-background rounded-xl p-5 text-center border border-border hover-lift">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-headline">{t("cta.eventSupport")}</h3>
              <p className="text-sm text-body">{t("cta.eventSupportDesc")}</p>
            </div>
            <div className="bg-background rounded-xl p-5 text-center border border-border hover-lift">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-headline">{t("cta.consulting")}</h3>
              <p className="text-sm text-body">{t("cta.consultingDesc")}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={getWhatsappUrl("Halo, saya tertarik dengan layanan TeknoKerja")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("cta_default", "general")}
              className="btn-whatsapp inline-flex hover-glow"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {t("btn.whatsapp")}
            </a>
            <Link
              to={lp("/sewa-laptop")}
              className="inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {t("cta.service")}
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">{t("cta.areaNote")}</p>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
