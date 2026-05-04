import { useRef } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Laptop, Building, Users, ArrowRight, MapPin } from "lucide-react";
import { useScrollZoom } from "@/hooks/useScrollZoom";
import Hero3DCard from "./Hero3DCard";
import RotatingText from "./RotatingText";
import FloatingElement from "./FloatingElement";
import CursorParticles from "@/components/interactive/CursorParticles";
import ImmersiveBackground from "@/components/interactive/ImmersiveBackground";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

const WHATSAPP_NUMBER = "6283891088084";
const WHATSAPP_MESSAGE = "Halo, saya tertarik sewa laptop TeknoKerja";

const LaptopRentalSection = () => {
  const { t, lp, locale } = useLanguage();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

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
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-6">
                {t("hero.badge")}
              </span>
            </FloatingElement>

            <h1 className="text-[38px] md:text-[42px] lg:text-[52px] font-[800] text-headline leading-[1.15] mb-4 md:mb-5 tracking-tight max-w-[92%] md:max-w-none mx-auto lg:mx-0">
              <span className="inline">{t("hero.headline")}</span>{" "}
              <span className="inline overflow-hidden" style={{ height: "1.25em", verticalAlign: "baseline" }}>
                <RotatingText />
              </span>
            </h1>
            <p className="text-[17px] md:text-[17px] lg:text-lg text-body leading-[1.6] mb-5 md:mb-8 max-w-[90%] md:max-w-xl mx-auto lg:mx-0">
              {t("hero.sub1")}{" "}
              <span className="text-muted-foreground">
                {t("hero.sub2")}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 justify-center lg:justify-start">
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
                to={lp("/sewa-laptop")}
                className="btn-cta text-base px-8 py-[13px] sm:py-4 w-full sm:w-auto"
              >
                {t("hero.cta2")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--cta-green))] bg-[hsl(var(--cta-green)/0.1)] px-3 py-1 rounded-full">
                💰 {t("hero.fromPrice")}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("hero.location")}</span>
                <span className="text-muted-foreground">•</span>
                <span>{t("hero.delivery")}</span>
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
