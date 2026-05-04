import { Link } from "react-router-dom";
import { ArrowRight, Laptop } from "lucide-react";
import { useLaptopProducts } from "@/hooks/useLaptopProducts";
import LaptopStockCard from "@/components/stock/LaptopStockCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";

const LaptopStockPreview = () => {
  const { t, lp } = useLanguage();
  const { data: products, isLoading, isError } = useLaptopProducts();

  // Max 2 rows: 4 cols on desktop = 8 items max
  const previewProducts = products?.slice(0, 8);

  if (isError) return null;

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Laptop className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-headline">
              {t("stock.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("stock.subtitle")}
            </p>
          </div>
        </div>
        <Link
          to={lp("/laptop-stock")}
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
        >
          {t("stock.viewAll")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden">
              <Skeleton className="aspect-[4/3]" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewProducts?.map((product) => (
              <LaptopStockCard key={product.id} product={product} />
            ))}
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="md:hidden flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {previewProducts?.map((product) => (
              <div key={product.id} className="min-w-[250px] snap-start">
                <LaptopStockCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 text-center sm:hidden">
        <Link
          to={lp("/laptop-stock")}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          {t("stock.viewAll")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default LaptopStockPreview;
