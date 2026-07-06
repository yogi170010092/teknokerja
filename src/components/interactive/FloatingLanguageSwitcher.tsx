import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { useLanguage, SUPPORTED_LOCALES } from "@/i18n/LanguageContext";
import type { Locale } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

const LABEL: Record<Locale, string> = { en: "EN", id: "ID", ru: "RU", zh: "中文" };

const FloatingLanguageSwitcher = () => {
  const { locale, switchLocaleHref } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div
      ref={ref}
      className="fixed right-4 z-50 md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
    >
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-2xl shadow-xl py-2 min-w-[120px] animate-fade-in">
          {SUPPORTED_LOCALES.map((l) => (
            <Link
              key={l}
              to={switchLocaleHref(l)}
              hrefLang={l}
              onClick={() => {
                trackEvent("menu_click", { item: "lang_switch", from: locale, to: l, location: "floating_mobile" });
                setOpen(false);
              }}
              className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                l === locale ? "text-primary bg-primary/10" : "text-body hover:bg-secondary hover:text-primary"
              }`}
            >
              {LABEL[l]}
            </Link>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-1.5 px-3 h-10 rounded-full bg-card border border-border shadow-lg text-headline text-sm font-semibold active:scale-95 transition-transform"
      >
        <Globe className="w-4 h-4" />
        {LABEL[locale]}
      </button>
    </div>
  );
};

export default FloatingLanguageSwitcher;
