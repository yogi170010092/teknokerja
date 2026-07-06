import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import logoTeknokerja from "@/assets/logo-teknokerja.png";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";
import { buildDefaultWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/whatsapp";

const EMAIL = "iklansatu7@gmail.com";
const PHONE = "+62 838-9108-8084";
const ADDRESS = "Jl. Tukad Yeh Biu No.29, Sesetan, Denpasar Selatan, Bali 80225";

const Footer = () => {
  const { t, lp, locale } = useLanguage();
  const currentYear = new Date().getFullYear();
  const whatsappUrl = buildDefaultWhatsAppUrl(locale);

  return (
    <footer className="bg-secondary border-t border-border">
      {/* CTA Section */}
      <div className="bg-card border-b border-border">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-headline">{t("footer.ctaTitle")}</h3>
              <p className="text-body">{t("footer.ctaDesc")}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { location: "footer_cta", locale, service_category: "general" })}
                className="btn-whatsapp flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {t("btn.whatsapp")}
              </a>
              <Link
                to={lp("/sewa-laptop")}
                className="inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                {t("btn.viewService")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link to={lp("/")} className="inline-block mb-4">
              <img src={logoTeknokerja} alt="TeknoKerja - Laptop Rental Bali" className="h-20 w-auto" loading="lazy" />
            </Link>
            <p className="text-base text-body mb-4">{t("footer.brand")}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold text-headline mb-4">{t("footer.services")}</h4>
            <ul className="space-y-3">
              <li>
                <Link to={lp("/sewa-laptop")} className="text-base text-body hover:text-primary transition-colors font-semibold">
                  🔥 {t("btn.rentLaptop")}
                </Link>
              </li>
              <li>
                <Link to={lp("/laptop-stock")} className="text-base text-body hover:text-primary transition-colors">
                  {t("nav.stock")}
                </Link>
              </li>
              <li>
                <Link to={lp("/how-it-works")} className="text-base text-body hover:text-primary transition-colors">
                  {t("nav.howItWorks")}
                </Link>
              </li>
              <li>
                <Link to={lp("/faq")} className="text-base text-body hover:text-primary transition-colors">
                  {t("nav.faq")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-headline mb-4">{t("footer.links")}</h4>
            <ul className="space-y-3">
              <li>
                <Link to={lp("/tentang")} className="text-base text-body hover:text-primary transition-colors">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link to={lp("/kontak")} className="text-base text-body hover:text-primary transition-colors">
                  {t("footer.contactUs")}
                </Link>
              </li>
              <li>
                <Link to={lp("/syarat-ketentuan")} className="text-base text-body hover:text-primary transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <a
                  href="https://balisalecomputer.id"
                  target="_blank"
                  rel="noopener external"
                  className="text-base text-body hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Bali Sale Computer ↗
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-headline mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-base text-body">{ADDRESS}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href={`tel:+${WHATSAPP_NUMBER}`} className="text-base text-body hover:text-primary transition-colors">
                  {PHONE}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href={`mailto:${EMAIL}`} className="text-base text-body hover:text-primary transition-colors">
                  {EMAIL}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { location: "footer", locale, service_category: "general" })}
                  className="btn-whatsapp w-full justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t("btn.whatsapp")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-body">
          <p>© {currentYear} TeknoKerja Digital Media. {t("footer.copyright")}</p>
          <p className="font-medium">{t("footer.tagline")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
