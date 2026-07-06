import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEOHead, BreadcrumbNav, BreadcrumbSchema } from "@/components/seo";
import { useLanguage } from "@/i18n/LanguageContext";
import { Calendar, ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  meta_description: string | null;
  published_at: string | null;
  locale: string;
  tags: string[];
}

const Blog = () => {
  const { t, locale, lp } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id,title,slug,excerpt,featured_image,meta_description,published_at,locale,tags")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setArticles((data ?? []) as Article[]);
        setLoading(false);
      });
  }, []);

  const filtered = articles.filter((a) => a.locale === locale);
  const list = filtered.length ? filtered : articles;

  const title = locale === "en" ? "Laptop Rental Blog — Bali Tips & Guides | TeknoKerja"
    : locale === "ru" ? "Блог об аренде ноутбуков на Бали | TeknoKerja"
    : locale === "zh" ? "巴厘岛笔记本租赁博客 | TeknoKerja"
    : "Blog Sewa Laptop Bali — Tips & Panduan | TeknoKerja";
  const desc = locale === "en" ? "Guides, tips, and stories about renting laptops in Bali as a tourist, digital nomad, or remote team."
    : "Panduan, tips, dan cerita seputar sewa laptop di Bali untuk wisatawan dan digital nomad.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={title} description={desc} canonical="https://teknokerja.com/blog" />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://teknokerja.com/" },
        { name: "Blog", url: "https://teknokerja.com/blog" },
      ]} />
      <Header />
      <main className="container py-10 md:py-14">
        <BreadcrumbNav items={[{ label: "Blog" }]} />
        <header className="mb-10 mt-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-headline mb-3">Blog</h1>
          <p className="text-body max-w-2xl">{desc}</p>
        </header>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border h-72 animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-caption">
            {locale === "en" ? "No articles yet — check back soon." : "Belum ada artikel — segera hadir."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((a) => (
              <Link
                key={a.id}
                to={lp(`/blog/${a.slug}`)}
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {a.featured_image ? (
                  <div className="aspect-video bg-secondary overflow-hidden">
                    <img src={a.featured_image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
                <div className="p-5">
                  {a.published_at && (
                    <div className="flex items-center gap-1.5 text-xs text-caption mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(a.published_at).toLocaleDateString(locale === "id" ? "id-ID" : locale)}
                    </div>
                  )}
                  <h2 className="font-bold text-headline mb-2 line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h2>
                  {a.excerpt && <p className="text-sm text-body line-clamp-3">{a.excerpt}</p>}
                  <div className="flex items-center gap-1 text-primary text-sm font-medium mt-3">
                    {locale === "en" ? "Read more" : "Selengkapnya"} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

export const BlogPost = () => {
  const { slug } = useParams();
  const { locale, lp } = useLanguage();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setArticle(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center text-caption">Loading…</div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-headline mb-3">{locale === "en" ? "Article not found" : "Artikel tidak ditemukan"}</h1>
          <Link to={lp("/blog")} className="text-primary underline">{locale === "en" ? "Back to blog" : "Kembali ke blog"}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const canonical = `https://teknokerja.com/blog/${article.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={article.meta_title || `${article.title} | TeknoKerja`}
        description={article.meta_description || article.excerpt || ""}
        canonical={canonical}
        ogImage={article.featured_image || undefined}
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://teknokerja.com/" },
        { name: "Blog", url: "https://teknokerja.com/blog" },
        { name: article.title, url: canonical },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        image: article.featured_image ? [article.featured_image] : undefined,
        datePublished: article.published_at,
        dateModified: article.updated_at,
        author: { "@type": "Organization", name: "TeknoKerja" },
        publisher: { "@type": "Organization", name: "TeknoKerja" },
      }) }} />

      <Header />
      <main className="container py-10 md:py-14 max-w-3xl">
        <BreadcrumbNav items={[
          { label: "Blog", href: lp("/blog") },
          { label: article.title },
        ]} />
        <article className="mt-6">
          <header className="mb-8">
            {article.published_at && (
              <div className="text-sm text-caption mb-3">
                {new Date(article.published_at).toLocaleDateString(locale === "id" ? "id-ID" : locale, { dateStyle: "long" })}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold text-headline leading-tight mb-4">{article.title}</h1>
            {article.excerpt && <p className="text-lg text-body">{article.excerpt}</p>}
          </header>

          {article.featured_image && (
            <img src={article.featured_image} alt={article.title} className="w-full rounded-2xl mb-8" loading="lazy" />
          )}

          <div
            className="prose prose-lg max-w-none text-body prose-headings:text-headline prose-a:text-primary prose-strong:text-headline"
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
};
