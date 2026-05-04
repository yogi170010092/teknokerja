import { Users, Laptop, Clock, Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const TrustStats = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, value: "500+", labelKey: "trust.stat1" as const },
    { icon: Laptop, value: "120+", labelKey: "trust.stat2" as const },
    { icon: Clock, valueKey: "trust.stat3val" as const, labelKey: "trust.stat3" as const },
    { icon: Star, value: "4.9 / 5", labelKey: "trust.stat4" as const },
  ];

  return (
    <section className="container py-12 md:py-16">
      <div className="text-center mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-headline mb-3">
          {t("trust.title")}
        </h2>
        <p className="text-body max-w-2xl mx-auto">{t("trust.sub")}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map(({ icon: Icon, value, valueKey, labelKey }) => (
          <div
            key={labelKey}
            className="bg-card rounded-2xl border border-border p-5 md:p-6 text-center hover-lift"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-headline mb-1">
              {value ?? t(valueKey!)}
            </div>
            <div className="text-sm text-body">{t(labelKey)}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustStats;
