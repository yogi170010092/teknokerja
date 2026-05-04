import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, MessageCircle, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoTeknokerja from "@/assets/logo-teknokerja.png";
import { trackEvent } from "@/lib/analytics";
import MobileMenuOverlay from "./MobileMenuOverlay";
import { useLanguage, SUPPORTED_LOCALES } from "@/i18n/LanguageContext";
import type { Locale } from "@/i18n/translations";

const WHATSAPP_NUMBER = "6283891088084";
const WHATSAPP_MESSAGE = "Hi TeknoKerja, I'd like to rent a laptop in Bali.";

const LOCALE_LABEL: Record<Locale, string> = {
  en: "EN",
  id: "ID",
  ru: "RU",
  zh: "中文",
};

const Header = () => {
  const { t, locale, lp, switchLocaleHref } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldPulseCTA, setShouldPulseCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShouldPulseCTA(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    trackEvent("whatsapp_click", { location: "header", locale, service_category: "general" });
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ${isScrolled ? "header-scrolled" : ""}`}
      >
        {/* Top Bar */}
        <div className="bg-secondary py-1.5 sm:py-2 hidden sm:block">
          <div className="container flex items-center justify-between text-xs text-caption">
            <span className="truncate">{t("header.tagline")}</span>
            <div className="hidden md:flex items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-whatsapp hover:underline"
              >
                <MessageCircle className="w-3 h-3" />
                +62 838-9108-8084
              </a>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={`container transition-all duration-300 ${isScrolled ? "py-2" : "py-2.5 sm:py-3"}`}>
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <Link to={lp("/")} className="flex items-center gap-3 flex-shrink-0">
              <img
                src={logoTeknokerja}
                alt="TeknoKerja Laptop Rental Bali"
                className={`w-auto transition-all duration-300 ${isScrolled ? "h-8 sm:h-9 md:h-10" : "h-9 sm:h-12 md:h-14"}`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              <Link to={lp("/")} className="text-base font-semibold text-headline hover:text-primary transition-colors">
                {t("nav.home")}
              </Link>
              <Link to={lp("/sewa-laptop")} className="text-base font-bold text-primary hover:text-primary/80 transition-colors">
                {t("nav.rental")}
              </Link>
              <Link to={lp("/how-it-works")} className="text-base font-semibold text-headline hover:text-primary transition-colors">
                {t("nav.howItWorks")}
              </Link>
              <Link to={lp("/faq")} className="text-base font-semibold text-headline hover:text-primary transition-colors">
                {t("nav.faq")}
              </Link>
              <Link to={lp("/tentang")} className="text-base font-semibold text-headline hover:text-primary transition-colors">
                {t("nav.about")}
              </Link>
              <Link to={lp("/kontak")} className="text-base font-semibold text-headline hover:text-primary transition-colors">
                {t("nav.contact")}
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher (desktop) */}
              <div className="relative group hidden md:block">
                <button
                  className="flex items-center gap-1 px-3 py-2 rounded-full border border-border bg-card hover:border-primary/40 transition-colors text-sm font-semibold text-headline"
                  aria-label="Change language"
                >
                  <Globe className="w-4 h-4" />
                  <span>{LOCALE_LABEL[locale]}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-card rounded-xl shadow-lg border border-border py-2 min-w-[140px]">
                    {SUPPORTED_LOCALES.map((l) => (
                      <Link
                        key={l}
                        to={switchLocaleHref(l)}
                        hrefLang={l}
                        onClick={() => trackEvent("menu_click", { item: "lang_switch", from: locale, to: l })}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          l === locale
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-body hover:bg-secondary hover:text-primary"
                        }`}
                      >
                        {LOCALE_LABEL[l]}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className={`hidden sm:inline-flex btn-whatsapp transition-all duration-300 hover:scale-105 active:scale-95 text-sm ${
                  shouldPulseCTA ? "animate-cta-attention" : ""
                }`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("btn.rentLaptop")}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden p-2 h-11 w-11 hover:bg-secondary active:scale-90 transition-all"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;
