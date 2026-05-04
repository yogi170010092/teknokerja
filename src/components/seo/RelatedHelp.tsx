import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Locale } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * "Related help" cross-link module — designed to:
 *  - Increase session time / pages-per-visit (internal interlinking).
 *  - Improve crawl depth: every page surfaces nearby canonical pages with
 *    descriptive anchor text (good for SEO + AI crawlers).
 *  - Surface FAQ-style snippets that ChatGPT / Perplexity can extract directly.
 */

export interface RelatedItem {
  /** Internal app path (without locale prefix). */
  path: string;
  /** Lucide-style icon component. */
  icon: typeof HelpCircle;
}

interface RelatedHelpProps {
  /** Where this module is rendered — used for analytics & A/B. */
  location: "sewa" | "faq" | "how" | "tentang";
}

type Copy = { eyebrow: string; title: string; sub: string };

const HEADINGS: Record<Locale, Copy> = {
  en: {
    eyebrow: "Related Help",
    title: "Articles & FAQs you might find useful",
    sub: "Quick answers and guides to help you decide faster.",
  },
  id: {
    eyebrow: "Bantuan Terkait",
    title: "Artikel & FAQ yang mungkin bermanfaat",
    sub: "Jawaban cepat dan panduan agar keputusan Anda lebih mudah.",
  },
  ru: {
    eyebrow: "Связанная помощь",
    title: "Статьи и ответы, которые могут помочь",
    sub: "Быстрые ответы и руководства, чтобы вы решили быстрее.",
  },
  zh: {
    eyebrow: "相关帮助",
    title: "您可能感兴趣的文章与常见问题",
    sub: "快速答案与指南，帮助您更快做出决定。",
  },
};

type LinkCopy = { title: string; desc: string };

const ITEM_COPY: Record<string, Record<Locale, LinkCopy>> = {
  "/how-it-works": {
    en: { title: "How laptop rental works in Bali", desc: "4 simple steps from WhatsApp message to delivery at your villa." },
    id: { title: "Cara sewa laptop di Bali", desc: "4 langkah mudah dari chat WhatsApp hingga laptop diantar." },
    ru: { title: "Как работает аренда ноутбуков на Бали", desc: "4 простых шага от сообщения в WhatsApp до доставки на виллу." },
    zh: { title: "巴厘岛笔记本租赁流程", desc: "从 WhatsApp 留言到送达别墅的 4 个简单步骤。" },
  },
  "/faq": {
    en: { title: "Frequently asked questions", desc: "Pricing, deposits, passport, MacBook availability and delivery zones." },
    id: { title: "Pertanyaan yang sering diajukan", desc: "Harga, deposit, paspor, ketersediaan MacBook, dan area antar." },
    ru: { title: "Часто задаваемые вопросы", desc: "Цены, депозит, паспорт, MacBook и зоны доставки." },
    zh: { title: "常见问题", desc: "价格、押金、护照、MacBook 库存与配送区域。" },
  },
  "/sewa-laptop": {
    en: { title: "Laptop rental services overview", desc: "All rental options: work, office, events, short-term projects." },
    id: { title: "Layanan sewa laptop lengkap", desc: "Pilihan sewa untuk kerja, kantor, event, dan project sementara." },
    ru: { title: "Услуги по аренде ноутбуков", desc: "Все варианты: работа, офис, мероприятия, краткосрочные проекты." },
    zh: { title: "笔记本租赁服务总览", desc: "工作、办公、活动、短期项目的全部租赁选项。" },
  },
  "/tentang": {
    en: { title: "About TeknoKerja", desc: "Why hundreds of travelers and digital nomads choose us in Bali." },
    id: { title: "Tentang TeknoKerja", desc: "Kenapa ratusan wisatawan & digital nomad memilih kami di Bali." },
    ru: { title: "О TeknoKerja", desc: "Почему сотни путешественников и цифровых кочевников выбирают нас." },
    zh: { title: "关于 TeknoKerja", desc: "为什么数百位旅客和数字游牧者选择我们。" },
  },
  "/syarat-ketentuan": {
    en: { title: "Terms & conditions", desc: "Deposit policy, damages, returns and cancellation rules." },
    id: { title: "Syarat & ketentuan", desc: "Kebijakan deposit, kerusakan, pengembalian, dan pembatalan." },
    ru: { title: "Условия и положения", desc: "Депозит, ущерб, возврат и отмена." },
    zh: { title: "条款与条件", desc: "押金、损坏、归还与取消政策。" },
  },
  "/kontak": {
    en: { title: "Contact us", desc: "WhatsApp, email and pickup address in Denpasar, Bali." },
    id: { title: "Hubungi kami", desc: "WhatsApp, email, dan alamat di Denpasar, Bali." },
    ru: { title: "Связаться с нами", desc: "WhatsApp, e-mail и адрес в Денпасаре, Бали." },
    zh: { title: "联系我们", desc: "WhatsApp、电子邮件以及登巴萨的取车地址。" },
  },
};

const PRESETS: Record<RelatedHelpProps["location"], RelatedItem[]> = {
  sewa: [
    { path: "/how-it-works", icon: BookOpen },
    { path: "/faq", icon: HelpCircle },
    { path: "/syarat-ketentuan", icon: BookOpen },
  ],
  faq: [
    { path: "/sewa-laptop", icon: BookOpen },
    { path: "/how-it-works", icon: BookOpen },
    { path: "/tentang", icon: HelpCircle },
  ],
  how: [
    { path: "/sewa-laptop", icon: BookOpen },
    { path: "/faq", icon: HelpCircle },
    { path: "/kontak", icon: BookOpen },
  ],
  tentang: [
    { path: "/sewa-laptop", icon: BookOpen },
    { path: "/how-it-works", icon: BookOpen },
    { path: "/faq", icon: HelpCircle },
  ],
};

const RelatedHelp = ({ location }: RelatedHelpProps) => {
  const { locale, lp } = useLanguage();
  const headings = HEADINGS[locale];
  const items = PRESETS[location];

  return (
    <section className="container py-12 md:py-16" aria-labelledby="related-help-title">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" /> {headings.eyebrow}
        </span>
        <h2 id="related-help-title" className="text-2xl md:text-3xl font-bold text-headline">
          {headings.title}
        </h2>
        <p className="text-body mt-2 max-w-xl mx-auto">{headings.sub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(({ path, icon: Icon }) => {
          const c = ITEM_COPY[path]?.[locale] ?? ITEM_COPY[path]?.en;
          if (!c) return null;
          return (
            <Link
              key={path}
              to={lp(path)}
              onClick={() =>
                trackEvent("menu_click", {
                  item: "related_help",
                  target: path,
                  location,
                  locale,
                })
              }
              className="group flex flex-col p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-headline mb-1.5 leading-snug">{c.title}</h3>
              <p className="text-sm text-body leading-relaxed flex-1">{c.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                {locale === "id" ? "Baca selengkapnya" : locale === "ru" ? "Подробнее" : locale === "zh" ? "阅读更多" : "Read more"}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedHelp;
