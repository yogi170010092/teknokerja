import { useEffect, useState } from "react";
import { Instagram, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";

interface IgItem {
  id: string;
  image_url: string;
  alt_text: string | null;
  link_url: string | null;
}

const InstagramSection = () => {
  const { locale, t } = useLanguage();
  const { instagram_url, instagram_handle } = useWebsiteSettings();
  const [items, setItems] = useState<IgItem[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("instagram_gallery")
        .select("id, image_url, alt_text, link_url")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(12);
      setItems((data ?? []) as IgItem[]);
    })();
  }, []);

  // Hide section entirely if no images uploaded (no Unsplash fallback).
  if (items !== null && items.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-background" aria-label={t("ig.heading")}>
      <div className="container">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2 inline-flex items-center gap-1.5 justify-center">
            <Instagram className="w-3.5 h-3.5" /> {t("ig.eyebrow")}
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-headline mb-3">
            {t("ig.heading")}
          </h2>
          <p className="text-body max-w-2xl mx-auto">{t("ig.sub")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 mb-8">
          {(items ?? []).map((img, i) => (
            <a
              key={img.id}
              href={img.link_url || instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("instagram_click", { location: "ig_gallery", index: i, locale })}
              className="relative group block aspect-square overflow-hidden rounded-xl bg-muted"
              aria-label={`Open ${instagram_handle} on Instagram`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text ?? `${instagram_handle} Instagram photo`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#f09433]/70 via-[#dc2743]/60 to-[#bc1888]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white" />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href={instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("instagram_click", { location: "ig_follow_cta", locale })}
            className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full text-white bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 transition-opacity hover-lift"
          >
            <Instagram className="w-5 h-5" />
            {t("ig.follow")} {instagram_handle}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
