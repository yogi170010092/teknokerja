/**
 * Central WhatsApp helper — builds wa.me URL, returns a locale-aware default
 * message, and emits a fully-dimensioned `whatsapp_click` event so every CTA
 * can be sliced by locale + service category + page location in GA4 / GTM /
 * Meta Pixel without per-callsite ceremony.
 */
import { trackEvent } from "@/lib/analytics";
import { logLead } from "@/lib/leads";
import { notifyAdmin } from "@/lib/notifyAdmin";
import type { Locale } from "@/i18n/translations";

export const WHATSAPP_NUMBER = "6283891088084";

export type ServiceCategory =
  | "general"
  | "rental_daily"
  | "rental_weekly"
  | "rental_monthly"
  | "rental_work"
  | "rental_office"
  | "rental_event"
  | "rental_project"
  | "consultation"
  | "support"
  | "stock_inquiry";

export interface WhatsAppCTAConfig {
  message: string;
  location: string;
  category?: ServiceCategory;
  locale?: string;
  extra?: Record<string, string | number | boolean | undefined | null>;
}

/** Default opening message per locale — used by every generic CTA. */
const DEFAULT_MESSAGES: Record<Locale, string> = {
  id: "Halo TeknoKerja, saya ingin sewa laptop di Bali.",
  en: "Hello TeknoKerja, I would like to rent a laptop in Bali.",
  ru: "Здравствуйте, я хочу арендовать ноутбук на Бали.",
  zh: "您好，我想在巴厘岛租一台笔记本电脑。",
};

export const getDefaultWhatsAppMessage = (locale?: string): string => {
  const key = (locale ?? "en") as Locale;
  return DEFAULT_MESSAGES[key] ?? DEFAULT_MESSAGES.en;
};

export const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/** Convenience: build URL with the locale's default message. */
export const buildDefaultWhatsAppUrl = (locale?: string) =>
  buildWhatsAppUrl(getDefaultWhatsAppMessage(locale));

export const trackWhatsAppClick = (cfg: Omit<WhatsAppCTAConfig, "message">) => {
  trackEvent("whatsapp_click", {
    location: cfg.location,
    service_category: cfg.category ?? "general",
    locale: cfg.locale,
    ...cfg.extra,
  });
  // Persist to Lovable Cloud so admins can see lead volume in the dashboard.
  logLead({
    event_type: "whatsapp_click",
    location: cfg.location,
    service_category: cfg.category ?? "general",
    locale: cfg.locale,
  });
  // Throttled admin email — max 1 per session per location to avoid inbox spam.
  try {
    if (typeof sessionStorage !== "undefined") {
      const key = `wa_notif_${cfg.location}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        notifyAdmin("whatsapp_lead", {
          Lokasi: cfg.location,
          Kategori: cfg.category ?? "general",
          Locale: cfg.locale ?? "—",
          Halaman: typeof window !== "undefined" ? window.location.pathname : "—",
        });
      }
    }
  } catch {
    /* noop */
  }
};

/** Convenience for inline onClick handlers. */
export const handleWhatsAppCTA = (cfg: Omit<WhatsAppCTAConfig, "message">) => () =>
  trackWhatsAppClick(cfg);
