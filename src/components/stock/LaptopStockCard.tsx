import { ExternalLink, MessageCircle, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import type { LaptopProduct } from "@/lib/scrapeProducts";
import { useLanguage } from "@/i18n/LanguageContext";
import { buildWhatsAppUrl, getDefaultWhatsAppMessage } from "@/lib/whatsapp";


interface Props {
  product: LaptopProduct;
}

const LaptopStockCard = ({ product }: Props) => {
  const { t, locale } = useLanguage();
  const waUrl = buildWhatsAppUrl(
    `${getDefaultWhatsAppMessage(locale)} (${product.name} — ${product.price})`
  );

  return (
    <div className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted/30 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product.image}
          alt={`Sewa ${product.name} - Laptop Rental Bali | ${product.brand}`}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width={300}
          height={225}
        />
        {product.condition && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent/15 text-accent">
            {product.condition}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold text-primary mb-1">
          {product.brand}
        </span>
        <h3 className="font-semibold text-headline text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {product.specs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.specs.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <p className="text-lg font-bold text-headline mb-3">
            {product.price}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg border border-[hsl(var(--whatsapp))] text-[hsl(var(--whatsapp))] hover:bg-[hsl(var(--whatsapp)/0.08)] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>

            {/* Rent Now */}
            <Link
              to={`/rent/${product.id}`}
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Rent Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopStockCard;
