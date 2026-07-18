import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, Cpu, MemoryStick, HardDrive } from "lucide-react";
import { useLaptopProducts } from "@/hooks/useLaptopProducts";
import { useLanguage } from "@/i18n/LanguageContext";
import { buildWhatsAppUrl, getDefaultWhatsAppMessage } from "@/lib/whatsapp";
import { Skeleton } from "@/components/ui/skeleton";

const formatRp = (n: number | null | undefined) =>
  n && n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "—";

const FeaturedLaptopsSection = () => {
  const { lp, locale, t } = useLanguage();

  const { data, isLoading } = useLaptopProducts();
  const items = (data ?? []).slice(0, 6);

  const STATUS_STYLES: Record<string, { dot: string; label: string; color: string }> = {
    ready:       { dot: "bg-green-500",  label: t("featured.statusReady"),  color: "text-green-700 bg-green-50" },
    rented:      { dot: "bg-red-500",    label: t("featured.statusRented"), color: "text-red-700 bg-red-50" },
    maintenance: { dot: "bg-orange-500", label: t("featured.statusMaint"),  color: "text-orange-700 bg-orange-50" },
  };

  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8 md:mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-2">
              {t("featured.eyebrow")}
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-headline tracking-tight">
              {t("featured.title")}
            </h2>
            <p className="text-body mt-2 max-w-xl">
              {t("featured.subtitle")}
            </p>
          </div>
          <Link
            to={lp("/laptops")}
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {t("featured.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>


        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t("featured.empty")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {items.map((p) => {
              const status = (p.status as string) || "ready";
              const style = STATUS_STYLES[status] ?? STATUS_STYLES.ready;
              const isReady = status === "ready";
              const waUrl = buildWhatsAppUrl(
                `${getDefaultWhatsAppMessage(locale)} (${p.name})`
              );
              const dailyText = p.priceDaily ? formatRp(p.priceDaily) : p.price;

              return (
                <article
                  key={p.id}
                  className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-muted/30 flex items-center justify-center p-4 overflow-hidden">
                    <img
                      src={p.image}
                      alt={`Rent ${p.name} laptop in Bali`}
                      loading="lazy"
                      width={400}
                      height={300}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${style.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
                      {p.brand}
                    </span>
                    <h3 className="font-semibold text-headline text-sm md:text-base leading-snug mb-3 line-clamp-2">
                      {p.name}
                    </h3>

                    {p.specs.length > 0 && (
                      <ul className="space-y-1 text-xs text-body mb-4">
                        {p.specs.slice(0, 3).map((spec, i) => {
                          const Icon = i === 0 ? Cpu : i === 1 ? MemoryStick : HardDrive;
                          return (
                            <li key={i} className="flex items-center gap-1.5">
                              <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{spec}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="mt-auto pt-3 border-t border-border">
                      <p className="text-[11px] text-muted-foreground">{t("featured.from")}</p>
                      <p className="text-lg font-extrabold text-headline mb-3">
                        {dailyText}
                        <span className="text-xs font-medium text-muted-foreground"> {t("featured.perDay")}</span>
                      </p>

                      {isReady ? (
                        <div className="grid grid-cols-2 gap-2">
                          {/* WhatsApp */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-lg border border-green-500 text-green-600 py-2 text-sm font-medium hover:bg-green-50 transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </a>

                          {/* Rent Now */}
                          <Link
                            to={lp(`/rent/${p.id}`)}
                            className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 transition"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Rent Now
                          </Link>
                        </div>
                      ) : (
                        <button
                          disabled
                          className="w-full text-xs font-semibold py-2.5 rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                        >
                          {style.label}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10 md:hidden">
          <Link
            to={lp("/laptops")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {t("featured.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedLaptopsSection;
