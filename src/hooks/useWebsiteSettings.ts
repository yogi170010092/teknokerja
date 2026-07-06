/**
 * Site-wide settings read from the `website_settings` key/value table.
 * Falls back to compiled defaults so the UI always renders even before
 * an admin has saved anything.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WebsiteSettings {
  brand_name: string;
  whatsapp_number: string;     // digits only, no +/space
  contact_email: string;
  phone: string;
  address: string;
  business_hours: string;
  google_place_id: string;
  google_maps_embed: string;   // full <iframe src> URL, optional override
  instagram_url: string;
  instagram_handle: string;
  tiktok_url: string;
  gtm_id: string;
  meta_pixel_id: string;
  og_image_url: string;
  logo_url: string;
}

const DEFAULTS: WebsiteSettings = {
  brand_name: "TeknoKerja",
  whatsapp_number: "6283891088084",
  contact_email: "iklansatu7@gmail.com",
  phone: "+62 838-9108-8084",
  address:
    "Jl. Tukad Yeh Biu No.29, Sesetan, Denpasar Selatan, Kota Denpasar, Bali 80225",
  business_hours: "Mon–Fri 09:00–18:00 · Sat 09:00–14:00",
  google_place_id: "",
  google_maps_embed: "",
  instagram_url: "https://www.instagram.com/teknokerja",
  instagram_handle: "@teknokerja",
  tiktok_url: "",
  gtm_id: "GTM-THWG6H4T",
  meta_pixel_id: "3452303348251213",
  og_image_url: "https://teknokerja.com/og-image-new.jpg",
  logo_url: "/favicon-192x192.png",
};

const KEYS: Record<string, keyof WebsiteSettings> = {
  "site.brand_name": "brand_name",
  "site.whatsapp_number": "whatsapp_number",
  "site.contact_email": "contact_email",
  "site.phone": "phone",
  "site.address": "address",
  "site.business_hours": "business_hours",
  "site.google_place_id": "google_place_id",
  "site.google_maps_embed": "google_maps_embed",
  "site.instagram_url": "instagram_url",
  "site.instagram_handle": "instagram_handle",
  "site.tiktok_url": "tiktok_url",
  "seo.gtm_id": "gtm_id",
  "seo.meta_pixel_id": "meta_pixel_id",
  "seo.og_image_url": "og_image_url",
  "site.logo_url": "logo_url",
};

let cache: WebsiteSettings | null = null;
let pending: Promise<WebsiteSettings> | null = null;

async function fetchSettings(): Promise<WebsiteSettings> {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    const { data } = await supabase
      .from("website_settings")
      .select("key,value")
      .in("key", Object.keys(KEYS));
    const next: WebsiteSettings = { ...DEFAULTS };
    (data ?? []).forEach((row: any) => {
      const field = KEYS[row.key];
      if (!field) return;
      const raw = typeof row.value === "string" ? row.value : row.value?.value ?? "";
      if (raw) (next as any)[field] = raw;
    });
    cache = next;
    return next;
  })();
  return pending;
}

/** Invalidate cache (call from admin Settings page after save). */
export function invalidateWebsiteSettings() {
  cache = null;
  pending = null;
}

export function useWebsiteSettings(): WebsiteSettings {
  const [state, setState] = useState<WebsiteSettings>(cache ?? DEFAULTS);
  useEffect(() => {
    let alive = true;
    fetchSettings().then((s) => { if (alive) setState(s); });
    return () => { alive = false; };
  }, []);
  return state;
}
