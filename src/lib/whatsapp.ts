/**
 * Central WhatsApp helper — builds wa.me URL and emits a fully-dimensioned
 * `whatsapp_click` event so every CTA can be sliced by locale + service category
 * + page location in GA4 / GTM / Meta Pixel without per-callsite ceremony.
 */
import { trackEvent } from "@/lib/analytics";

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

export const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const trackWhatsAppClick = (cfg: Omit<WhatsAppCTAConfig, "message">) => {
  trackEvent("whatsapp_click", {
    location: cfg.location,
    service_category: cfg.category ?? "general",
    locale: cfg.locale,
    ...cfg.extra,
  });
};

/** Convenience for inline onClick handlers. */
export const handleWhatsAppCTA = (cfg: Omit<WhatsAppCTAConfig, "message">) => () =>
  trackWhatsAppClick(cfg);
