import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { translations, type Locale, type TranslationKey } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  /** Build a path with the current locale prefix (e.g. "/sewa-laptop" -> "/ru/sewa-laptop"). */
  lp: (path: string) => string;
  /** Same path on another locale (used by language switcher). */
  switchLocaleHref: (target: Locale) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const SUPPORTED_LOCALES: Locale[] = ["en", "id", "ru", "zh"];
const PREFIXED: Locale[] = ["id", "ru", "zh"]; // EN lives at root

/** Parse locale + remainder from a pathname. EN = root (no prefix). */
export function parseLocaleFromPath(pathname: string): { locale: Locale; rest: string } {
  const m = pathname.match(/^\/(id|ru|zh)(\/.*)?$/);
  if (m) {
    return { locale: m[1] as Locale, rest: m[2] || "/" };
  }
  return { locale: "en", rest: pathname || "/" };
}

/** Build a localized path. */
export function buildLocalizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return clean === "/" ? "/" : clean;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { locale: urlLocale, rest } = useMemo(
    () => parseLocaleFromPath(location.pathname),
    [location.pathname]
  );

  const [locale, setLocaleState] = useState<Locale>(urlLocale);

  // Keep state in sync with URL (back/forward navigation, deep links).
  useEffect(() => {
    if (urlLocale !== locale) setLocaleState(urlLocale);
    document.documentElement.lang = urlLocale;
    try { localStorage.setItem("locale", urlLocale); } catch {}
  }, [urlLocale, locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      const target = buildLocalizedPath(next, rest) + location.search + location.hash;
      navigate(target);
    },
    [rest, location.search, location.hash, navigate]
  );

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) return key;
      // RU/ZH currently fall back to EN (placeholder until translated).
      const value = (entry as any)[locale] ?? entry.en ?? entry.id ?? key;
      return value;
    },
    [locale]
  );

  const lp = useCallback((path: string) => buildLocalizedPath(locale, path), [locale]);

  const switchLocaleHref = useCallback(
    (target: Locale) => buildLocalizedPath(target, rest),
    [rest]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, lp, switchLocaleHref }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export { PREFIXED };