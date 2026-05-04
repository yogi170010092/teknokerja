// Analytics utility for tracking events
// Ready to integrate with Google Analytics, Google Tag Manager, or other analytics services

type EventName =
  | "whatsapp_click"
  | "cta_click"
  | "pricing_click"
  | "form_submit"
  | "scroll_cta_dismissed"
  | "menu_click"
  | "page_view"
  | "faq_open"
  | "lang_switch";

interface EventData {
  [key: string]: string | number | boolean | undefined | null;
}

/** Detect current locale from URL path so every event is automatically dimensioned. */
function detectLocale(): "en" | "id" | "ru" | "zh" {
  if (typeof window === "undefined") return "en";
  const m = window.location.pathname.match(/^\/(id|ru|zh)(\/|$)/);
  return (m ? m[1] : "en") as any;
}

export const trackEvent = (eventName: EventName, data?: EventData) => {
  const locale = detectLocale();
  const enriched = { locale, page_path: typeof window !== "undefined" ? window.location.pathname : undefined, ...data };

  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, enriched);
  }

  // Google Analytics 4 (gtag.js)
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, enriched);
  }

  // Google Tag Manager dataLayer (also used by GTM-THWG6H4T container)
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...enriched,
    });
  }

  // Meta Pixel — map our key events to standard Pixel events
  if (typeof window !== "undefined" && (window as any).fbq) {
    if (eventName === "whatsapp_click") (window as any).fbq("track", "Contact", enriched);
    else if (eventName === "form_submit") (window as any).fbq("track", "Lead", enriched);
    else if (eventName === "pricing_click") (window as any).fbq("track", "InitiateCheckout", enriched);
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  trackEvent("page_view", { path, title });
};
