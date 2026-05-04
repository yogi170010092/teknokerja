import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const TestimonialsSection = () => {
  const { t } = useLanguage();

  const testimonials = [
    { textKey: "testi.1.text" as const, nameKey: "testi.1.name" as const, roleKey: "testi.1.role" as const, initials: "SM" },
    { textKey: "testi.2.text" as const, nameKey: "testi.2.name" as const, roleKey: "testi.2.role" as const, initials: "DK" },
    { textKey: "testi.3.text" as const, nameKey: "testi.3.name" as const, roleKey: "testi.3.role" as const, initials: "YT" },
  ];

  return (
    <section className="container py-12 md:py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-headline mb-3">
          {t("testi.title")}
        </h2>
        <p className="text-body max-w-2xl mx-auto">{t("testi.sub")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {testimonials.map((tst) => (
          <article
            key={tst.nameKey}
            className="bg-card rounded-2xl border border-border p-6 hover-lift relative"
          >
            <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
            <div className="flex gap-1 mb-3" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-body leading-relaxed mb-5">"{t(tst.textKey)}"</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                {tst.initials}
              </div>
              <div>
                <div className="font-semibold text-headline text-sm">{t(tst.nameKey)}</div>
                <div className="text-xs text-caption">{t(tst.roleKey)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
