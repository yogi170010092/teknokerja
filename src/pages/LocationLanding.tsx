import { useParams, Navigate, Link } from "react-router-dom";
import { MapPin, Clock, ShieldCheck, MessageCircle, Truck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEOHead, BreadcrumbNav, BreadcrumbSchema } from "@/components/seo";
import FAQSchema from "@/components/seo/FAQSchema";
import { useLanguage } from "@/i18n/LanguageContext";
import { buildDefaultWhatsAppUrl, trackWhatsAppClick } from "@/lib/whatsapp";
import LaptopNeedsForm from "@/components/interactive/LaptopNeedsForm";

interface LocationData {
  slug: string;
  name: string;
  region: string;
  intro: { en: string; id: string };
  audience: { en: string; id: string };
  deliveryTime: string;
  highlights: { en: string[]; id: string[] };
  landmarks: string[];
}

export const LOCATIONS: LocationData[] = [
  {
    slug: "canggu",
    name: "Canggu",
    region: "Badung",
    deliveryTime: "1–3h",
    intro: {
      en: "Same-day laptop rental delivered to your villa, coworking space or café in Canggu — built for digital nomads and remote workers.",
      id: "Sewa laptop antar hari yang sama ke villa, coworking, atau café di Canggu — untuk digital nomad dan pekerja remote.",
    },
    audience: {
      en: "Digital nomads at Outpost, Dojo, Tropical Nomad and surf-and-work travellers.",
      id: "Digital nomad di Outpost, Dojo, Tropical Nomad, dan traveler surf-and-work.",
    },
    highlights: {
      en: ["Free delivery to most Canggu villas", "MacBook & ThinkPad in stock", "Weekly & monthly nomad rates"],
      id: ["Antar gratis ke kebanyakan villa Canggu", "MacBook & ThinkPad tersedia", "Tarif mingguan & bulanan nomad"],
    },
    landmarks: ["Berawa", "Batu Bolong", "Echo Beach", "Pererenan"],
  },
  {
    slug: "ubud",
    name: "Ubud",
    region: "Gianyar",
    deliveryTime: "2–4h",
    intro: {
      en: "Reliable laptop rental delivered to Ubud villas, jungle stays and coworking spaces — perfect for long-stay creators.",
      id: "Sewa laptop terpercaya, antar ke villa, jungle stay, dan coworking Ubud — cocok untuk creator long-stay.",
    },
    audience: {
      en: "Writers, designers, and remote teams staying in Ubud, Penestanan, and Tegallalang.",
      id: "Penulis, desainer, dan tim remote di Ubud, Penestanan, dan Tegallalang.",
    },
    highlights: {
      en: ["Door-to-door delivery to Ubud area", "Backup power & local SIM tips included", "Best monthly rates for long stays"],
      id: ["Antar langsung ke area Ubud", "Tips power backup & SIM lokal", "Harga bulanan terbaik untuk long stay"],
    },
    landmarks: ["Penestanan", "Tegallalang", "Sayan", "Mas"],
  },
  {
    slug: "seminyak",
    name: "Seminyak",
    region: "Badung",
    deliveryTime: "1–2h",
    intro: {
      en: "Premium laptop rental in Seminyak — MacBook Pro, gaming and business laptops delivered to your villa or hotel.",
      id: "Sewa laptop premium di Seminyak — MacBook Pro, gaming, dan laptop bisnis diantar ke villa atau hotel.",
    },
    audience: {
      en: "Business travellers, event organisers, and luxury villa guests in Seminyak and Petitenget.",
      id: "Pebisnis, EO, dan tamu villa di Seminyak dan Petitenget.",
    },
    highlights: {
      en: ["1–2 hour delivery in Seminyak", "Setup & support included", "Bulk units for events"],
      id: ["Antar 1–2 jam di Seminyak", "Setup & support termasuk", "Tersedia bulk untuk event"],
    },
    landmarks: ["Petitenget", "Oberoi", "Double Six", "Kerobokan"],
  },
  {
    slug: "kuta",
    name: "Kuta",
    region: "Badung",
    deliveryTime: "1–2h",
    intro: {
      en: "Affordable laptop rental in Kuta and Legian — quick airport pickup option for tourists who arrive without a laptop.",
      id: "Sewa laptop terjangkau di Kuta dan Legian — opsi pickup bandara cepat untuk turis yang datang tanpa laptop.",
    },
    audience: {
      en: "Short-stay tourists, conference attendees, and airport arrivals.",
      id: "Turis short-stay, peserta konferensi, dan kedatangan bandara.",
    },
    highlights: {
      en: ["Airport pickup option", "Daily rates from Rp 100K", "Same-day return supported"],
      id: ["Opsi pickup bandara", "Mulai Rp 100K per hari", "Bisa pengembalian hari yang sama"],
    },
    landmarks: ["Legian", "Tuban", "Ngurah Rai Airport", "Kuta Beach"],
  },
  {
    slug: "uluwatu",
    name: "Uluwatu",
    region: "Badung",
    deliveryTime: "2–4h",
    intro: {
      en: "Laptop rental delivered to Uluwatu, Bingin and Pecatu — ideal for surfers who work between sessions.",
      id: "Sewa laptop diantar ke Uluwatu, Bingin, dan Pecatu — pas untuk surfer yang kerja di antara sesi ombak.",
    },
    audience: {
      en: "Surf-and-work travellers, content creators, and villa guests on the Bukit.",
      id: "Surfer-pekerja, content creator, dan tamu villa di Bukit.",
    },
    highlights: {
      en: ["Delivery across the Bukit", "Hardy travel sleeves provided", "Weekly nomad pricing"],
      id: ["Antar ke seluruh Bukit", "Sleeve travel kuat disediakan", "Harga mingguan nomad"],
    },
    landmarks: ["Bingin", "Padang Padang", "Pecatu", "Nusa Dua"],
  },
];

const LocationLanding = () => {
  const { slug } = useParams();
  const { locale } = useLanguage();
  const loc = LOCATIONS.find((l) => l.slug === slug);
  if (!loc) return <Navigate to="/" replace />;

  const isEn = locale !== "id";
  const intro = isEn ? loc.intro.en : loc.intro.id;
  const audience = isEn ? loc.audience.en : loc.audience.id;
  const highlights = isEn ? loc.highlights.en : loc.highlights.id;

  const title = isEn
    ? `Laptop Rental ${loc.name} Bali — Same-Day Delivery | TeknoKerja`
    : `Sewa Laptop ${loc.name} Bali — Antar Hari Ini | TeknoKerja`;
  const desc = isEn
    ? `Rent a MacBook or business laptop in ${loc.name}, Bali. Delivery in ${loc.deliveryTime}, passport-only deposit, daily/weekly/monthly rates from Rp 100K.`
    : `Sewa MacBook & laptop bisnis di ${loc.name}, Bali. Antar dalam ${loc.deliveryTime}, deposit paspor, harian/mingguan/bulanan mulai Rp 100K.`;

  const canonical = `https://teknokerja.com/laptop-rental-${loc.slug}`;
  const waUrl = buildDefaultWhatsAppUrl(locale);

  const faqItems = [
    {
      question: isEn ? `How fast can you deliver to ${loc.name}?` : `Berapa cepat antar ke ${loc.name}?`,
      answer: isEn
        ? `We typically deliver within ${loc.deliveryTime} of your WhatsApp confirmation across ${loc.name} and nearby areas like ${loc.landmarks.slice(0, 2).join(" and ")}.`
        : `Biasanya antar dalam ${loc.deliveryTime} setelah konfirmasi WhatsApp ke ${loc.name} dan sekitarnya seperti ${loc.landmarks.slice(0, 2).join(" dan ")}.`,
    },
    {
      question: isEn ? "What deposit do you need from tourists?" : "Deposit apa yang diperlukan untuk turis?",
      answer: isEn
        ? "A valid passport and a refundable cash or transfer deposit. No Indonesian residency or KTP required."
        : "Paspor yang berlaku dan deposit (cash/transfer) yang dapat dikembalikan. Tidak butuh KTP atau status residen.",
    },
    {
      question: isEn ? "Can I rent for a month or longer?" : "Bisa sewa sebulan atau lebih?",
      answer: isEn
        ? "Yes — monthly nomad rates are our most popular option, with discounts for 3-month and 6-month commitments."
        : "Bisa — tarif bulanan untuk nomad paling populer, dengan diskon untuk komitmen 3 dan 6 bulan.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={title}
        description={desc}
        canonical={canonical}
        keywords={`laptop rental ${loc.name.toLowerCase()}, sewa laptop ${loc.name.toLowerCase()}, macbook rental ${loc.name.toLowerCase()} bali`}
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://teknokerja.com/" },
        { name: `Laptop Rental ${loc.name}`, url: canonical },
      ]} />
      <FAQSchema items={faqItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: `TeknoKerja Laptop Rental — ${loc.name}`,
        description: desc,
        areaServed: { "@type": "Place", name: `${loc.name}, Bali` },
        priceRange: "Rp 100.000 – Rp 5.000.000",
      }) }} />

      <Header />
      <main>
        <div className="container pt-6">
          <BreadcrumbNav items={[{ label: `Laptop Rental ${loc.name}` }]} />
        </div>

        {/* Hero */}
        <section className="container py-10 md:py-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <MapPin className="w-3.5 h-3.5" /> {loc.name}, {loc.region}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-headline leading-tight mb-4">
                {isEn ? `Laptop Rental in ${loc.name}, Bali` : `Sewa Laptop di ${loc.name}, Bali`}
              </h1>
              <p className="text-lg text-body mb-6">{intro}</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick({ location: `location_${loc.slug}_hero`, category: "rental_work", locale })}
                  className="btn-whatsapp"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {isEn ? "WhatsApp Now" : "WhatsApp Sekarang"}
                </a>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-sm">
                <div className="flex items-center gap-2 text-body"><Clock className="w-4 h-4 text-primary" /> {isEn ? "Delivery" : "Antar"} {loc.deliveryTime}</div>
                <div className="flex items-center gap-2 text-body"><ShieldCheck className="w-4 h-4 text-primary" /> {isEn ? "Passport deposit only" : "Cukup deposit paspor"}</div>
                <div className="flex items-center gap-2 text-body"><Truck className="w-4 h-4 text-primary" /> {isEn ? "Free local delivery" : "Antar gratis area"}</div>
              </div>
            </div>
            <div><LaptopNeedsForm /></div>
          </div>
        </section>

        {/* Why this area */}
        <section className="container py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-4">
            {isEn ? `Why renters in ${loc.name} choose TeknoKerja` : `Kenapa pelanggan di ${loc.name} pilih TeknoKerja`}
          </h2>
          <p className="text-body mb-8 max-w-3xl">{audience}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {highlights.map((h, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3"><ShieldCheck className="w-5 h-5" /></div>
                <p className="font-medium text-headline">{h}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <section className="container py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-4">
            {isEn ? "Coverage areas" : "Area cakupan"}
          </h2>
          <p className="text-body mb-6">
            {isEn ? `We regularly deliver to:` : `Kami rutin antar ke:`}
          </p>
          <div className="flex flex-wrap gap-2">
            {loc.landmarks.map((lm) => (
              <span key={lm} className="px-3 py-1.5 rounded-full bg-secondary text-headline text-sm border border-border">{lm}</span>
            ))}
          </div>
        </section>

        {/* Cross-link to other locations */}
        <section className="container py-10 md:py-14 border-t border-border">
          <h2 className="text-xl md:text-2xl font-bold text-headline mb-4">
            {isEn ? "Other Bali locations" : "Lokasi Bali lainnya"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.filter((l) => l.slug !== loc.slug).map((l) => (
              <Link key={l.slug} to={`/laptop-rental-${l.slug}`} className="px-4 py-2 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-colors text-sm font-medium">
                {l.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LocationLanding;
