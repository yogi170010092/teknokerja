import { Link } from "react-router-dom";
import { useLanguage, SUPPORTED_LOCALES } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/i18n/translations";

const LABEL: Record<Locale, string> = { en: "EN", id: "ID", ru: "RU", zh: "ZH" };
const ARIA: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
  ru: "Русский",
  zh: "中文",
};

const LanguageSwitcher = () => {
  const { locale, switchLocaleHref } = useLanguage();

  return (
    <div className="flex items-center rounded-full border border-border bg-secondary/50 text-xs font-semibold overflow-hidden">
      {SUPPORTED_LOCALES.map((l) => {
        const active = locale === l;
        return (
          <Link
            key={l}
            to={switchLocaleHref(l)}
            hrefLang={l}
            aria-label={ARIA[l]}
            aria-current={active ? "true" : undefined}
            onClick={() => trackEvent("lang_switch", { from: locale, to: l })}
            className={`px-2.5 py-1 transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-body hover:text-primary"
            }`}
          >
            {LABEL[l]}
          </Link>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
