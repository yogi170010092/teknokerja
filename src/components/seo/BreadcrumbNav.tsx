import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => {
  const { lp } = useLanguage();
  return (
    <nav aria-label="Breadcrumb" className="py-4 border-b border-border">
      <ol className="container flex items-center gap-2 text-sm flex-wrap">
        <li>
          <Link
            to={lp("/")}
            className="text-caption hover:text-primary transition-colors flex items-center gap-1"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-caption" aria-hidden="true" />
            {item.href ? (
              <Link
                to={item.href}
                className="text-caption hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-body line-clamp-1">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
