import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, MessageCircle, X, ZoomIn, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface DbTestimonial {
  id: string;
  customer_name: string;
  company: string | null;
  location: string | null;
  laptop_rented: string | null;
  rating: number;
  comment: string | null;
  screenshot_url: string | null;
  testimonial_date: string | null;
}

const initials = (name: string) =>
  name.split(/\s+/).map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const TestimonialsSection = () => {
  const { t, lp } = useLanguage();
  const [rows, setRows] = useState<DbTestimonial[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id,customer_name,company,location,laptop_rented,rating,comment,screenshot_url,testimonial_date", { count: "exact" })
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("testimonial_date", { ascending: false, nullsFirst: false })
      .limit(6)
      .then(({ data, count }) => {
        setRows((data ?? []) as DbTestimonial[]);
        setTotalCount(count ?? (data?.length ?? 0));
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : (i + 1) % rows.length));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : (i - 1 + rows.length) % rows.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, rows.length]);

  const aggregate = rows.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "TeknoKerja Laptop Rental Bali",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1),
      reviewCount: rows.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: rows.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customer_name },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.comment ?? "",
      datePublished: r.testimonial_date ?? undefined,
    })),
  } : null;

  return (
    <section className="container py-12 md:py-20">
      {aggregate && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregate) }} />
      )}

      <div className="text-center mb-10 md:mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">
          {t("rev.eyebrow")}
        </p>
        <h2 className="text-2xl md:text-4xl font-extrabold text-headline mb-3">
          {t("rev.heading")}
        </h2>
        <p className="text-body max-w-2xl mx-auto">{t("rev.sub")}</p>
      </div>

      {!loaded ? (
        <div className="text-center text-caption py-12">{t("ui.loading")}</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-caption py-12">{t("rev.empty")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {rows.map((r, idx) => (
            <article
              key={r.id}
              className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover-lift"
            >
              {r.screenshot_url ? (
                <button
                  onClick={() => setLightboxIdx(idx)}
                  className="relative group block w-full bg-[#ECE5DD] aspect-[3/4] overflow-hidden"
                  aria-label={`${t("rev.viewScreenshot")} — ${r.customer_name}`}
                >
                  <img
                    src={r.screenshot_url}
                    alt={`WhatsApp review from ${r.customer_name} — ${r.laptop_rented ?? "laptop rental Bali"}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/95 text-headline rounded-full px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5" /> {t("rev.viewScreenshot")}
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-[hsl(var(--whatsapp))] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </span>
                </button>
              ) : (
                <div className="bg-primary/5 p-6 flex-1 flex items-center">
                  {r.comment && <p className="text-body italic leading-relaxed">"{r.comment}"</p>}
                </div>
              )}

              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                    {initials(r.customer_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-headline text-sm truncate">{r.customer_name}</div>
                    <div className="text-xs text-caption truncate">
                      {[r.location, r.laptop_rented].filter(Boolean).join(" · ") || t("rev.verified")}
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0" aria-label={`${r.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {loaded && rows.length > 0 && (
        <div className="text-center mt-8 md:mt-10">
          <Link
            to={lp("/reviews")}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-3 rounded-full transition-colors hover-lift"
          >
            {t("rev.viewAll")}{totalCount > 6 ? ` (${totalCount})` : ""}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}


      {/* Lightbox */}
      {lightboxIdx !== null && rows[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setLightboxIdx(null)}
            aria-label={t("ui.close")}
          >
            <X className="w-6 h-6" />
          </button>
          {rows.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + rows.length) % rows.length); }}
                aria-label={t("ui.prev")}
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % rows.length); }}
                aria-label={t("ui.next")}
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
          <img
            src={rows[lightboxIdx].screenshot_url!}
            alt={`WhatsApp review from ${rows[lightboxIdx].customer_name}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;
