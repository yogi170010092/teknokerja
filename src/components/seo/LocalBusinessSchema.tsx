import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const LocalBusinessSchema = () => {
  useEffect(() => {
    let cancelled = false;

    const inject = async () => {
      // Compute real aggregate rating from published testimonials.
      let aggregateRating: any = null;
      try {
        const { data } = await supabase
          .from("testimonials")
          .select("rating")
          .eq("published", true);
        if (data && data.length > 0) {
          const valid = data.filter((r: any) => typeof r.rating === "number" && r.rating > 0);
          if (valid.length > 0) {
            const avg = valid.reduce((s: number, r: any) => s + r.rating, 0) / valid.length;
            aggregateRating = {
              "@type": "AggregateRating",
              ratingValue: avg.toFixed(1),
              reviewCount: String(valid.length),
              bestRating: "5",
            };
          }
        }
      } catch { /* no-op */ }

      if (cancelled) return;

      const existing = document.querySelector('script[data-schema="local-business"]');
      if (existing) existing.remove();

      const schema: any = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "TeknoKerja Laptop Rental Bali",
        "image": "https://teknokerja.com/og-image-new.jpg",
        "description": "Laptop rental in Bali for digital nomads, tourists, remote workers, and events. Daily, weekly, monthly. Free delivery in Bali.",
        "@id": "https://teknokerja.com",
        "url": "https://teknokerja.com",
        "telephone": "+6283891088084",
        "email": "iklansatu7@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. Tukad Yeh Biu No.29, Sesetan",
          "addressLocality": "Denpasar Selatan",
          "addressRegion": "Bali",
          "postalCode": "80225",
          "addressCountry": "ID",
        },
        "geo": { "@type": "GeoCoordinates", "latitude": -8.7034, "longitude": 115.2267 },
        "openingHoursSpecification": [
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00" },
        ],
        "priceRange": "Rp100.000 - Rp1.000.000",
        "areaServed": { "@type": "Place", "name": "Bali, Indonesia" },
        "sameAs": ["https://www.instagram.com/teknokerja"],
      };
      if (aggregateRating) schema.aggregateRating = aggregateRating;

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", "local-business");
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    inject();
    return () => {
      cancelled = true;
      const s = document.querySelector('script[data-schema="local-business"]');
      if (s) s.remove();
    };
  }, []);

  return null;
};

export default LocalBusinessSchema;
