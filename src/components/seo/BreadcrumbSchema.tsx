import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  useEffect(() => {
    // Remove existing breadcrumb schema
    const existingScript = document.querySelector('script[data-schema="breadcrumb"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url,
      })),
    };
    
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "breadcrumb");
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      script.remove();
    };
  }, [items]);
  
  return null;
};

export default BreadcrumbSchema;
