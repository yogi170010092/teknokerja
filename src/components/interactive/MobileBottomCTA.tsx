import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";

const WHATSAPP_NUMBER = "6283891088084";
const WHATSAPP_MESSAGE = "Halo TeknoKerja, saya mau sewa laptop.";

const MobileBottomCTA = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 1000);
    const pulseTimer = setTimeout(() => setShouldPulse(true), 15000);
    return () => { clearTimeout(showTimer); clearTimeout(pulseTimer); };
  }, []);

  const handleClick = () => {
    trackEvent("whatsapp_click", { location: "mobile_bottom_cta", service_category: "general" });
    window.open(whatsappUrl, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="mobile-cta-pill lg:hidden">
      <button onClick={handleClick} className={`animate-float ${shouldPulse ? "animate-whatsapp-pulse" : ""}`} aria-label="Chat WhatsApp">
        <MessageCircle className="w-5 h-5" />
        <span>{t("btn.whatsapp")}</span>
      </button>
    </div>
  );
};

export default MobileBottomCTA;
