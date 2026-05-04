import { useEffect } from "react";

interface ServiceSchemaProps {
  name: string;
  description: string;
  provider?: string;
  areaServed?: string;
  serviceType?: string;
}

const ServiceSchema = ({
  name,
  description,
  provider = "TeknoKerja Digital Media",
  areaServed = "Bali, Indonesia",
  serviceType = "Sewa Laptop",
}: ServiceSchemaProps) => {
  useEffect(() => {
    // Remove existing service schema
    const existingScript = document.querySelector('script[data-schema="service"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": name,
      "description": description,
      "provider": {
        "@type": "LocalBusiness",
        "name": provider,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. Tukad Yeh Biu No.29, Sesetan",
          "addressLocality": "Denpasar Selatan",
          "addressRegion": "Bali",
          "postalCode": "80225",
          "addressCountry": "ID"
        },
        "telephone": "+6283891088084",
        "email": "iklansatu7@gmail.com"
      },
      "areaServed": {
        "@type": "Place",
        "name": areaServed
      },
      "serviceType": serviceType,
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "IDR"
        }
      }
    };
    
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "service");
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      script.remove();
    };
  }, [name, description, provider, areaServed, serviceType]);
  
  return null;
};

export default ServiceSchema;
