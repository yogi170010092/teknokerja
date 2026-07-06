// Generates public/sitemap.xml at predev/prebuild.
// Pulls dynamic blog articles + location landings + static pages,
// emitting hreflang for EN/ID/RU/ZH (EN = root, others prefixed).
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = "https://teknokerja.com";
const LOCALES = ["en", "id", "ru", "zh"] as const;
const PREFIX: Record<(typeof LOCALES)[number], string> = { en: "", id: "/id", ru: "/ru", zh: "/zh" };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

interface Entry {
  path: string;             // path WITHOUT locale prefix, e.g. "/sewa-laptop"
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
  /** Single-locale page (e.g. blog post in one language) — skip hreflang. */
  noAlternates?: boolean;
  /** Override locale prefix (used by single-locale posts). */
  localePrefix?: string;
}

const today = new Date().toISOString().slice(0, 10);

const STATIC: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0", lastmod: today },
  { path: "/sewa-laptop", changefreq: "weekly", priority: "0.9", lastmod: today },
  { path: "/how-it-works", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/faq", changefreq: "weekly", priority: "0.85", lastmod: today },
  { path: "/laptops", changefreq: "daily", priority: "0.85", lastmod: today },
  { path: "/laptop-stock", changefreq: "daily", priority: "0.7", lastmod: today },
  { path: "/reviews", changefreq: "weekly", priority: "0.8", lastmod: today },
  { path: "/blog", changefreq: "weekly", priority: "0.8", lastmod: today },
  { path: "/tentang", changefreq: "monthly", priority: "0.6", lastmod: today },
  { path: "/kontak", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/syarat-ketentuan", changefreq: "yearly", priority: "0.4", lastmod: today },
  // Location landings (English root only — single locale pages today)
  { path: "/laptop-rental-canggu",   changefreq: "weekly", priority: "0.9", noAlternates: true, lastmod: today },
  { path: "/laptop-rental-seminyak", changefreq: "weekly", priority: "0.85", noAlternates: true, lastmod: today },
  { path: "/laptop-rental-ubud",     changefreq: "weekly", priority: "0.9", noAlternates: true, lastmod: today },
  { path: "/laptop-rental-kuta",     changefreq: "weekly", priority: "0.85", noAlternates: true, lastmod: today },
  { path: "/laptop-rental-uluwatu",  changefreq: "weekly", priority: "0.85", noAlternates: true, lastmod: today },
];

async function fetchArticles(): Promise<Entry[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=slug,locale,updated_at,published&published=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!r.ok) return [];
    const rows = (await r.json()) as Array<{ slug: string; locale: string; updated_at: string }>;
    return rows.map((row) => ({
      path: `/blog/${row.slug}`,
      lastmod: (row.updated_at || today).slice(0, 10),
      changefreq: "monthly",
      priority: "0.6",
      noAlternates: true,
      localePrefix: PREFIX[(row.locale as keyof typeof PREFIX)] ?? "",
    }));
  } catch {
    return [];
  }
}

function renderUrl(e: Entry): string {
  if (e.noAlternates) {
    const prefix = e.localePrefix ?? "";
    const loc = `${BASE_URL}${prefix}${e.path}`;
    return [
      `  <url>`,
      `    <loc>${loc}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n");
  }

  // Emit primary EN URL with hreflang alternates for all locales.
  const altLinks = LOCALES.map((loc) => {
    const p = PREFIX[loc];
    const href = e.path === "/" && p === "" ? `${BASE_URL}/` : `${BASE_URL}${p}${e.path === "/" ? "" : e.path}`;
    return `    <xhtml:link rel="alternate" hreflang="${loc}" href="${href}"/>`;
  }).join("\n");

  const enHref = e.path === "/" ? `${BASE_URL}/` : `${BASE_URL}${e.path}`;
  return [
    `  <url>`,
    `    <loc>${enHref}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    altLinks,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${enHref}"/>`,
    `  </url>`,
  ].filter(Boolean).join("\n");
}

async function main() {
  const dynamic = await fetchArticles();
  const all = [...STATIC, ...dynamic];

  // For static (multi-locale) entries: also emit explicit per-locale URLs so
  // crawlers index every prefixed copy.
  const localized: string[] = [];
  for (const e of STATIC) {
    for (const loc of LOCALES) {
      if (loc === "en") continue;
      const prefix = PREFIX[loc];
      const href = e.path === "/" ? `${BASE_URL}${prefix}` : `${BASE_URL}${prefix}${e.path}`;
      localized.push(
        [
          `  <url>`,
          `    <loc>${href}</loc>`,
          e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
          e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
          e.priority ? `    <priority>${e.priority}</priority>` : null,
          `  </url>`,
        ].filter(Boolean).join("\n")
      );
    }
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...all.map(renderUrl),
    ...localized,
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${all.length + localized.length} URLs, ${dynamic.length} dynamic blog posts)`);
}

main().catch((err) => { console.error(err); process.exit(0); });
