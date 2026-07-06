import { useRef } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Laptop, Building, Users, ArrowRight, MapPin } from "lucide-react";
import { useScrollZoom } from "@/hooks/useScrollZoom";
import Hero3DCard from "./Hero3DCard";
import FloatingElement from "./FloatingElement";
import CursorParticles from "@/components/interactive/CursorParticles";
import ImmersiveBackground from "@/components/interactive/ImmersiveBackground";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useReadyLaptopCount } from "@/hooks/useReadyLaptopCount";

const HERO_WA_MESSAGE = "Hi TeknoKerja, I'm interested in renting a laptop in Bali.";

const LaptopRentalSection = () => {
  const { t, lp, locale } = useLanguage();
  const whatsappUrl = buildWhatsAppUrl(HERO_WA_MESSAGE);
  const { data: readyCount, isLoading: countLoading } = useReadyLaptopCount();
  const showCount = !countLoading && typeof readyCount === "number" && readyCount > 0;

  const cardsRef = useRef<HTMLDivElement>(null);
  const scrollZoomStyles = useScrollZoom(cardsRef, {
    minScale: 1,
    maxScale: 1.05,
    translateY: -10,
    opacityStart: 1,
    opacityEnd: 0.95,
  });

  return (
    <section className="relative pt-10 pb-14 md:pt-14 md:pb-20 overflow-hidden">
      <ImmersiveBackground />
      <CursorParticles />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in text-center lg:text-left">
            <FloatingElement delay={0} duration={4} distance={4}>
              <span className="inline-flex items-center gap-2 bg-[hsl(var(--cta-green)/0.12)] text-[hsl(var(--cta-green))] text-sm font-bold px-4 py-2 rounded-full mb-6 border border-[hsl(var(--cta-green)/0.25)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--cta-green))] opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--cta-green))]" />
                </span>
                {showCount
                  ? `${readyCount} ${t("hero.badgeReady")}`
                  : t("hero.badgeAvailable")}
              </span>
            </FloatingElement>

            <h1 className="text-[36px] md:text-[44px] lg:text-[54px] font-[800] text-headline leading-[1.1] mb-4 md:mb-5 tracking-tight max-w-[92%] md:max-w-none mx-auto lg:mx-0">
              {t("hero.headline")}{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-deep,var(--primary)))] bg-clip-text text-transparent">
                {t("hero.headlineAccent")}
              </span>
            </h1>
            <p className="text-[16px] md:text-[17px] lg:text-lg text-body leading-[1.6] mb-5 md:mb-7 max-w-[92%] md:max-w-xl mx-auto lg:mx-0">
              {t("hero.sub1")}{" "}
              <span className="text-muted-foreground">
                {t("hero.sub2")}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 justify-center lg:justify-start">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { location: "hero", locale, service_category: "general" })}
                className="btn-whatsapp text-base px-8 py-[13px] sm:py-4 w-full sm:w-auto hover-glow"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("hero.cta1")}
              </a>
              <Link
                to={lp("/how-it-works")}
                className="btn-cta text-base px-8 py-[13px] sm:py-4 w-full sm:w-auto"
              >
                {t("hero.cta2")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-headline">{t("hero.location")}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--cta-green))] bg-[hsl(var(--cta-green)/0.1)] px-2.5 py-1 rounded-full">
                {t("hero.delivery")}
              </span>
            </div>

          </div>

          {/* Right Content - 3D Cards with Scroll Zoom */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{
              transform: scrollZoomStyles.transform,
              opacity: scrollZoomStyles.opacity,
              willChange: scrollZoomStyles.willChange,
            }}
          >
            <FloatingElement delay={0} duration={3.5} distance={8}>
              <Hero3DCard className="relative" intensity={12}>
                <div className="bg-card rounded-2xl p-6 text-center shadow-lg border border-border hover-lift group">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <Laptop className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-headline mb-2">{t("card.work")}</h3>
                  <p className="text-sm text-body">{t("card.workDesc")}</p>
                </div>
              </Hero3DCard>
            </FloatingElement>

            <FloatingElement delay={0.5} duration={4} distance={10}>
              <Hero3DCard className="relative" intensity={12}>
                <div className="bg-card rounded-2xl p-6 text-center shadow-lg border border-border hover-lift group">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <Building className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-headline mb-2">{t("card.office")}</h3>
                  <p className="text-sm text-body">{t("card.officeDesc")}</p>
                </div>
              </Hero3DCard>
            </FloatingElement>

            <FloatingElement delay={1} duration={3.8} distance={6}>
              <Hero3DCard className="relative" intensity={12}>
                <div className="bg-card rounded-2xl p-6 text-center shadow-lg border border-border hover-lift group">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-headline mb-2">{t("card.event")}</h3>
                  <p className="text-sm text-body">{t("card.eventDesc")}</p>
                </div>
              </Hero3DCard>
            </FloatingElement>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LaptopRentalSection;
