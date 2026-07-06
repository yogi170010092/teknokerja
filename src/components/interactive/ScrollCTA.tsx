import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import { buildDefaultWhatsAppUrl } from "@/lib/whatsapp";

const ScrollCTA = () => {
  const { t, locale } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const whatsappUrl = buildDefaultWhatsAppUrl(locale);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return;
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercentage >= 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleClick = () => {
    trackEvent("whatsapp_click", { location: "scroll_cta", locale, service_category: "general" });
    window.open(whatsappUrl, "_blank");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    trackEvent("scroll_cta_dismissed");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up hidden md:block">
      <div className="bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="container py-3 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base font-medium text-headline truncate">{t("scroll.title")}</p>
            <p className="text-xs md:text-sm text-body hidden sm:block">{t("scroll.sub")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleClick} className="btn-whatsapp text-xs md:text-sm whitespace-nowrap hover:scale-105 active:scale-95 transition-transform">
              <MessageCircle className="w-4 h-4 mr-1.5" />{t("btn.chatNow")}
            </button>
            <button onClick={handleDismiss} className="p-2 text-muted-foreground hover:text-headline transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollCTA;
