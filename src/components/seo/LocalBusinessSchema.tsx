import { useEffect } from "react";

const LocalBusinessSchema = () => {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-schema="local-business"]');
    if (existingScript) existingScript.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "TeknoKerja Digital Media",
      "image": "https://teknokerja.com/og-image-new.jpg",
      "description": "Jasa sewa laptop harian, mingguan, bulanan di Bali untuk kerja, WFH, bisnis, kantor, dan event. Kualitas terjamin, harga terjangkau.",
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
        "addressCountry": "ID"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -8.7034,
        "longitude": 115.2267
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "09:00",
          "closes": "14:00"
        }
      ],
      "priceRange": "Rp100.000 - Rp1.000.000",
      "areaServed": {
        "@type": "Place",
        "name": "Bali, Indonesia"
      },
      "sameAs": [],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "47",
        "bestRating": "5"
      }
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "local-business");
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => { script.remove(); };
  }, []);

  return null;
};

export default LocalBusinessSchema;
