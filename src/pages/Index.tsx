import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTABanner from "@/components/home/CTABanner";
import LaptopRentalSection from "@/components/home/LaptopRentalSection";
import FeaturedLaptopsSection from "@/components/home/FeaturedLaptopsSection";
import LaptopNeedsForm from "@/components/interactive/LaptopNeedsForm";
import PartnerBacklinkSection from "@/components/home/PartnerBacklinkSection";
import TrustStats from "@/components/home/TrustStats";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import GoogleMapsSection from "@/components/home/GoogleMapsSection";
import InstagramSection from "@/components/home/InstagramSection";
import { SEOHead, ServiceSchema, LocalBusinessSchema } from "@/components/seo";
import FAQSchema from "@/components/seo/FAQSchema";
import { useLanguage } from "@/i18n/LanguageContext";

const Index = () => {
  const { lp, t } = useLanguage();

  // Top FAQs for homepage rich results (AI-friendly answers).
  const homeFaqs = [
    {
      question: t("home.faq.q1"),
      answer: t("home.faq.a1"),
    },
    {
      question: t("home.faq.q2"),
      answer: t("home.faq.a2"),
    },
    {
      question: t("home.faq.q3"),
      answer: t("home.faq.a3"),
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
        <FeaturedLaptopsSection />
        <TrustStats />
        <TestimonialsSection />
        <InstagramSection />
        <GoogleMapsSection />
        <PartnerBacklinkSection />
        <LaptopNeedsForm />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
