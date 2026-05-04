import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
}

const SEOHead = ({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = "https://teknokerja.com/og-image-new.jpg",
  keywords,
  author = "TeknoKerja Digital Media",
  publishedTime,
  modifiedTime,
  articleSection,
}: SEOHeadProps) => {
  const fullTitle = title.includes("TeknoKerja") 
    ? title 
    : `${title} | TeknoKerja`;
  
  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };
    
    // Basic meta tags
    updateMeta("description", description);
    if (keywords) updateMeta("keywords", keywords);
    updateMeta("author", author);
    
    // Open Graph
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:image", ogImage, true);
    // Detect og:locale from canonical prefix; default = en
    let og = "en_US";
    if (canonical?.includes("/id")) og = "id_ID";
    else if (canonical?.includes("/ru")) og = "ru_RU";
    else if (canonical?.includes("/zh")) og = "zh_CN";
    updateMeta("og:locale", og, true);
    updateMeta("og:site_name", "TeknoKerja Digital Media", true);
    
    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);
    
    // Article specific
    if (ogType === "article") {
      if (publishedTime) updateMeta("article:published_time", publishedTime, true);
      if (modifiedTime) updateMeta("article:modified_time", modifiedTime, true);
      if (articleSection) updateMeta("article:section", articleSection, true);
      updateMeta("article:author", author, true);
    }
    
    // Update canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;

      // hreflang tags for international SEO (EN root, ID/RU/ZH prefixed).
      const ORIGIN = "https://teknokerja.com";
      const PREFIXES: Record<string, string> = { en: "", id: "/id", ru: "/ru", zh: "/zh" };
      let rest = canonical.startsWith(ORIGIN) ? canonical.slice(ORIGIN.length) : "/";
      const m2 = rest.match(/^\/(id|ru|zh)(\/.*)?$/);
      if (m2) rest = m2[2] || "/";
      const setHreflang = (lang: string, href: string) => {
        let el = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement;
        if (!el) {
          el = document.createElement("link");
          el.rel = "alternate";
          el.hreflang = lang;
          document.head.appendChild(el);
        }
        el.href = href;
      };
      Object.entries(PREFIXES).forEach(([lang, pfx]) => {
        const path = rest === "/" ? (pfx || "/") : `${pfx}${rest}`;
        setHreflang(lang, `${ORIGIN}${path}`);
      });
      setHreflang("x-default", `${ORIGIN}${rest === "/" ? "/" : rest}`);
    }
  }, [fullTitle, description, canonical, ogType, ogImage, keywords, author, publishedTime, modifiedTime, articleSection]);
  
  return null;
};

export default SEOHead;
