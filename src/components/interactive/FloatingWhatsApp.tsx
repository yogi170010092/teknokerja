import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import { buildDefaultWhatsAppUrl } from "@/lib/whatsapp";

const FloatingWhatsApp = () => {
  const { t, locale } = useLanguage();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const whatsappUrl = buildDefaultWhatsAppUrl(locale);

  useEffect(() => {
    const timer = setTimeout(() => setShouldPulse(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    trackEvent("whatsapp_click", { location: "floating_button", locale, service_category: "general" });
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex-col items-end gap-3 hidden md:flex">
      {isTooltipVisible && (
        <div className="animate-fade-in bg-card rounded-lg shadow-xl border border-border p-4 max-w-[250px] relative">
          <button onClick={() => setIsTooltipVisible(false)} className="absolute -top-2 -right-2 bg-muted rounded-full p-1 hover:bg-secondary transition-colors"><X className="w-3 h-3" /></button>
          <p className="text-sm text-body mb-2">{t("float.tooltip")}</p>
          <button onClick={handleClick} className="text-xs font-semibold text-primary hover:underline">{t("btn.startChat")}</button>
        </div>
      )}
      <button onClick={handleClick} onMouseEnter={() => setIsTooltipVisible(true)} className={`group flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(var(--whatsapp))] text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ${shouldPulse ? "animate-whatsapp-pulse" : ""}`} aria-label="Chat WhatsApp">
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default FloatingWhatsApp;
