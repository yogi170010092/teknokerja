import { MapPin, MessageCircle, Phone, Clock, Navigation } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { buildWhatsAppUrl, getDefaultWhatsAppMessage } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";

const COVERAGE = [
  "Canggu",
  "Seminyak",
  "Ubud",
  "Kuta",
  "Uluwatu",
  "Denpasar",
  "Sanur",
  "Jimbaran",
];

interface Props {
  variant?: "section" | "compact";
}

const GoogleMapsSection = ({ variant = "section" }: Props) => {
  const { locale, t } = useLanguage();
  const { address, business_hours, whatsapp_number, phone, google_maps_embed } =
    useWebsiteSettings();

  const mapQuery = encodeURIComponent(`TeknoKerja, ${address}`);
  const embedSrc =
    google_maps_embed ||
    `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
  const waUrl = buildWhatsAppUrl(getDefaultWhatsAppMessage(locale));

  return (
    <section
      className={variant === "section" ? "py-14 md:py-20 bg-muted/20" : "py-8"}
      aria-label={t("maps.heading")}
    >
      <div className="container">
        {variant === "section" && (
          <div className="text-center mb-8 md:mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">
              {t("maps.eyebrow")}
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-headline mb-3">
              {t("maps.heading")}
            </h2>
            <p className="text-body max-w-2xl mx-auto">{t("maps.sub")}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
          {/* Map */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-border shadow-lg bg-card">
            <div className="relative w-full h-[618px]">
              <iframe
                src={embedSrc}
                title="TeknoKerja Bali — Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 md:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-headline mb-1">
                    {t("maps.address")}
                  </h3>
                  <p className="text-sm text-body leading-relaxed">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-headline mb-1">
                    {t("maps.hours")}
                  </h3>
                  <p className="text-sm text-body">{business_hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-headline mb-1">
                    {t("maps.phone")}
                  </h3>
                  <a
                    href={`tel:+${whatsapp_number}`}
                    className="text-sm text-body hover:text-primary"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("whatsapp_click", {
                      location: "maps_section",
                      locale,
                      service_category: "support",
                    })
                  }
                  className="btn-whatsapp justify-center text-sm py-2.5"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  WhatsApp
                </a>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  {t("maps.directions")}
                </a>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 md:p-6">
              <h3 className="text-sm font-bold text-headline mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Delivery Information
              </h3>

              <div className="space-y-4 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="font-semibold text-green-600 mb-2">
                    🚚 Delivery Fee Rp50.000
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Badung",
                      "Kuta",
                      "Seminyak",
                      "Canggu",
                      "Jimbaran",
                      "Nusa Dua",
                    ].map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="font-semibold text-orange-600 mb-2">
                    🚚 Delivery Fee Rp100.000
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {["Uluwatu", "Pecatu", "Tabanan", "Bangli", "Buleleng"].map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Delivery outside these areas will be quoted separately via
                  WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleMapsSection;
