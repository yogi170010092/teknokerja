import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTABanner from "@/components/home/CTABanner";
import LaptopRentalSection from "@/components/home/LaptopRentalSection";
import LaptopNeedsForm from "@/components/interactive/LaptopNeedsForm";
import PartnerBacklinkSection from "@/components/home/PartnerBacklinkSection";
import TrustStats from "@/components/home/TrustStats";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { SEOHead, ServiceSchema, LocalBusinessSchema } from "@/components/seo";
import FAQSchema from "@/components/seo/FAQSchema";
import { useLanguage } from "@/i18n/LanguageContext";

const Index = () => {
  const { locale, lp, t } = useLanguage();

  // Top FAQs for homepage rich results (AI-friendly answers).
  const homeFaqs = [
    {
      question: locale === "en" ? "Where can I rent a laptop in Bali?" : "Di mana saya bisa menyewa laptop di Bali?",
      answer: locale === "en"
        ? "TeknoKerja delivers laptop rentals across Bali — Canggu, Seminyak, Ubud, Kuta, Sanur, and Denpasar — usually within hours of booking on WhatsApp. Rentals start from IDR 100,000 (~USD 7)."
        : "TeknoKerja mengantar sewa laptop ke seluruh Bali — Canggu, Seminyak, Ubud, Kuta, Sanur, dan Denpasar — biasanya dalam beberapa jam setelah pesan via WhatsApp. Mulai Rp100.000.",
    },
    {
      question: locale === "en" ? "Can tourists rent laptops in Bali?" : "Bisakah wisatawan menyewa laptop di Bali?",
      answer: locale === "en"
        ? "Yes. Foreign tourists and digital nomads can rent laptops with just a valid passport and a refundable deposit."
        : "Ya. Wisatawan asing dan digital nomad bisa sewa laptop hanya dengan paspor yang masih berlaku dan deposit yang dapat dikembalikan.",
    },
    {
      question: locale === "en" ? "How much does laptop rental cost in Bali?" : "Berapa biaya sewa laptop di Bali?",
      answer: locale === "en"
        ? "Rentals start from IDR 100,000 (~USD 7). Weekly and monthly packages offer significant discounts."
        : "Sewa mulai Rp100.000 (~USD 7). Paket mingguan dan bulanan jauh lebih hemat.",
    },
  ];

  const canonical = lp("/") === "/" ? "https://teknokerja.com/" : `https://teknokerja.com${lp("/")}`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.home.title")}
        description={t("seo.home.desc")}
        canonical={canonical}
        keywords="rent laptop bali, laptop rental bali, rent macbook bali, laptop hire bali tourists, bali digital nomad laptop rental, sewa laptop bali"
      />
      <ServiceSchema
        name="Laptop Rental Bali — TeknoKerja"
        description="Daily, weekly, and monthly laptop rental in Bali for tourists, digital nomads, remote workers, and events. From Rp 100,000 (~USD 7). Delivery to Canggu, Seminyak, Ubud, Kuta."
        serviceType="Laptop Rental"
        areaServed="Bali, Indonesia"
      />
      <LocalBusinessSchema />
      <FAQSchema items={homeFaqs} />
      <Header />

      <main>
        <LaptopRentalSection />
        <TrustStats />
        <TestimonialsSection />
        <PartnerBacklinkSection />
        <LaptopNeedsForm />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
