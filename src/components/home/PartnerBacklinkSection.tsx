import { ExternalLink, Laptop, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Backlink section to balisalecomputer.id — our trusted laptop supply partner.
 * Replaces the in-page laptop stock preview to keep the homepage fast and focused
 * on rental conversion, while passing dofollow link equity to the partner site.
 */
const PartnerBacklinkSection = () => {
  const { locale } = useLanguage();

  const copy = {
    en: {
      eyebrow: "Trusted Supply Partner",
      title: "Powered by Bali's Largest Laptop Marketplace",
      desc: "Every laptop we rent is sourced and serviced through Bali Sale Computer — Bali's most trusted destination for new and pre-owned laptops since 2018. Quality you can verify, units you can trust.",
      cta: "Browse Laptops at balisalecomputer.id",
      bullet1: "Verified specs & condition",
      bullet2: "Service center on the island",
      bullet3: "Buy or rent, your choice",
    },
    id: {
      eyebrow: "Mitra Pasokan Terpercaya",
      title: "Didukung Marketplace Laptop Terbesar di Bali",
      desc: "Setiap laptop yang kami sewakan bersumber dan diservis melalui Bali Sale Computer — destinasi laptop baru dan bekas paling terpercaya di Bali sejak 2018. Kualitas yang bisa diverifikasi.",
      cta: "Lihat Stok di balisalecomputer.id",
      bullet1: "Spesifikasi & kondisi terverifikasi",
      bullet2: "Service center di pulau",
      bullet3: "Beli atau sewa, sesuai pilihan",
    },
    ru: {
      eyebrow: "Надежный партнёр по поставкам",
      title: "При поддержке крупнейшего маркетплейса ноутбуков на Бали",
      desc: "Каждый ноутбук, который мы сдаём в аренду, поступает и обслуживается через Bali Sale Computer — самое надёжное место покупки ноутбуков на Бали с 2018 года.",
      cta: "Смотреть ноутбуки на balisalecomputer.id",
      bullet1: "Проверенные характеристики",
      bullet2: "Сервисный центр на острове",
      bullet3: "Купить или арендовать",
    },
    zh: {
      eyebrow: "可信赖的供应合作伙伴",
      title: "由巴厘岛最大的笔记本电脑市场提供支持",
      desc: "我们出租的每一台笔记本电脑均来自 Bali Sale Computer 的采购与维护——自 2018 年以来巴厘岛最值得信赖的笔记本电脑销售平台。品质可验证，机器可信赖。",
      cta: "前往 balisalecomputer.id 浏览笔记本",
      bullet1: "规格与状态已验证",
      bullet2: "岛内设有服务中心",
      bullet3: "购买或租赁，任您选择",
    },
  } as const;

  const t = copy[locale];

  return (
    <section className="container py-12 md:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 md:p-12">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-cta/10 blur-3xl pointer-events-none" />

        <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> {t.eyebrow}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-headline mb-3 leading-tight">
              {t.title}
            </h2>
            <p className="text-body mb-5 max-w-xl">{t.desc}</p>

            <ul className="grid sm:grid-cols-3 gap-2 mb-6">
              {[t.bullet1, t.bullet2, t.bullet3].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {b}
                </li>
              ))}
            </ul>

            <a
              href="https://balisalecomputer.id"
              target="_blank"
              rel="noopener external"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Laptop className="w-5 h-5" />
              {t.cta}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="relative w-48 h-48 rounded-3xl bg-gradient-to-br from-primary to-primary-glow shadow-2xl flex items-center justify-center rotate-3">
              <Laptop className="w-24 h-24 text-white/90" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerBacklinkSection;
