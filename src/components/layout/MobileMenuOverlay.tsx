import { useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, MessageCircle, Users, Phone, Home, HelpCircle, ListChecks, FileText } from "lucide-react";
import logoTeknokerja from "@/assets/logo-teknokerja.png";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { buildDefaultWhatsAppUrl } from "@/lib/whatsapp";

interface MobileMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { nameKey: TranslationKey; path: string; icon: typeof Home }[] = [
  { nameKey: "nav.home", path: "/", icon: Home },
  { nameKey: "nav.howItWorks", path: "/how-it-works", icon: ListChecks },
  { nameKey: "nav.faq", path: "/faq", icon: HelpCircle },
  { nameKey: "nav.about", path: "/tentang", icon: Users },
  { nameKey: "nav.contact", path: "/kontak", icon: Phone },
];

const MobileMenuOverlay = ({ isOpen, onClose }: MobileMenuOverlayProps) => {
  const { t, lp, locale } = useLanguage();
  const location = useLocation();
  const whatsappUrl = buildDefaultWhatsAppUrl(locale);

  const closeMenu = useCallback(() => {
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.height = "";
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open");
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      document.body.classList.remove("menu-open");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }
    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeMenu]);

  useEffect(() => {
    if (isOpen) closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleWhatsAppClick = () => {
    trackEvent("whatsapp_click", { location: "mobile_menu", locale, service_category: "general" });
  };

  const handleLinkClick = (itemName: string) => {
    trackEvent("menu_click", { item: itemName, location: "mobile_menu", locale });
    closeMenu();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div
        className="absolute inset-0 bg-foreground/25 backdrop-blur-sm animate-fade-in"
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex">
        <div className="relative w-12 sm:w-20 flex-shrink-0 overflow-hidden animate-wave-slide">
          <svg
            className="absolute top-0 right-0 h-full w-[200%] -translate-x-1/2"
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
            fill="hsl(var(--background))"
            aria-hidden="true"
          >
            <path
              d="M100,0 L100,800 L0,800 L0,0 Q50,100 0,200 Q50,300 0,400 Q50,500 0,600 Q50,700 0,800 L100,800 Z"
              className="animate-wave-morph"
            />
          </svg>
        </div>

        <div className="flex-1 bg-background animate-menu-slide-in flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border min-h-[72px]">
            <Link to={lp("/")} onClick={() => handleLinkClick("logo")} className="active:opacity-70 transition-opacity">
              <img src={logoTeknokerja} alt="TeknoKerja" className="h-9 sm:h-10 w-auto" />
            </Link>
            <button
              onClick={closeMenu}
              className="p-3 -mr-2 rounded-full hover:bg-secondary transition-colors active:scale-90 active:bg-secondary/80"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-headline" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 sm:px-6" aria-label="Main menu">
            <ul className="space-y-1.5">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const targetPath = lp(item.path);
                const isActive = location.pathname === targetPath;
                const label = t(item.nameKey);

                return (
                  <li key={item.path} className="animate-menu-item-fade" style={{ animationDelay: `${index * 60}ms` }}>
                    <Link
                      to={targetPath}
                      onClick={() => handleLinkClick(label)}
                      className={`mobile-menu-link ripple-effect ${
                        isActive
                          ? "text-primary bg-secondary"
                          : "text-headline hover:bg-secondary hover:text-primary"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="text-[18px]">{label}</span>
                    </Link>
                  </li>
                );
              })}
              <li className="animate-menu-item-fade" style={{ animationDelay: `${menuItems.length * 60}ms` }}>
                <Link
                  to={lp("/blog")}
                  onClick={() => handleLinkClick("Blog")}
                  className="mobile-menu-link ripple-effect text-headline hover:bg-secondary hover:text-primary"
                >
                  <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-[18px]">Blog</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="p-5 sm:p-6 border-t border-border bg-secondary/40 mobile-bottom-cta">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-full btn-whatsapp text-[17px] font-semibold active:scale-[0.97] transition-all duration-200 shadow-lg shadow-[hsl(var(--whatsapp))/0.3]"
            >
              <MessageCircle className="w-5 h-5" />
              {t("btn.whatsapp")}
            </a>
            <p className="text-center text-sm text-caption mt-3">{t("mobile.response")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuOverlay;
