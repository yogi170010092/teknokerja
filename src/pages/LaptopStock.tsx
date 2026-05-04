import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LaptopStockCard from "@/components/stock/LaptopStockCard";
import { useLaptopProducts } from "@/hooks/useLaptopProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo";
import { useLanguage } from "@/i18n/LanguageContext";
import { Laptop, RefreshCw } from "lucide-react";

const LaptopStock = () => {
  const { t, lp } = useLanguage();
  const { data: products, isLoading, isError, refetch, isFetching } = useLaptopProducts();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.stock.title")}
        description={t("seo.stock.desc")}
        canonical={`https://teknokerja.com${lp("/laptop-stock")}`}
        keywords="stok laptop bali, laptop stock bali, sewa laptop bali"
      />
      <Header />

      <main className="container py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Laptop className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-headline">
                {t("stockPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("stockPage.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {t("stock.refresh")}
          </button>
        </div>

        {isError && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">{t("stock.error")}</p>
            <button
              onClick={() => refetch()}
              className="text-primary font-medium hover:underline"
            >
              {t("stock.retry")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products?.map((product) => (
              <LaptopStockCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products && products.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            {t("stock.source")}
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LaptopStock;
