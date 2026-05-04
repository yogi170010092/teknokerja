import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import Tentang from "./pages/Tentang";
import Kontak from "./pages/Kontak";
import SewaLaptop from "./pages/SewaLaptop";
import LaptopStock from "./pages/LaptopStock";
import SyaratKetentuan from "./pages/SyaratKetentuan";
import HowItWorks from "./pages/HowItWorks";
import FAQPage from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import FloatingWhatsApp from "./components/interactive/FloatingWhatsApp";
import ScrollCTA from "./components/interactive/ScrollCTA";
import MobileBottomCTA from "./components/interactive/MobileBottomCTA";

const queryClient = new QueryClient();

// Reusable route group for one locale prefix (or root for EN).
const SiteRoutes = () => (
  <Routes>
    <Route index element={<Index />} />
    <Route path="sewa-laptop" element={<SewaLaptop />} />
    <Route path="laptop-stock" element={<LaptopStock />} />
    <Route path="tentang" element={<Tentang />} />
    <Route path="kontak" element={<Kontak />} />
    <Route path="syarat-ketentuan" element={<SyaratKetentuan />} />
    <Route path="how-it-works" element={<HowItWorks />} />
    <Route path="faq" element={<FAQPage />} />
    {/* Legacy blog URLs → 301-equivalent client redirect to /sewa-laptop */}
    <Route path="artikel/*" element={<Navigate to="/sewa-laptop" replace />} />
    <Route path="kategori/*" element={<Navigate to="/sewa-laptop" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <Routes>
            <Route path="/id/*" element={<SiteRoutes />} />
            <Route path="/ru/*" element={<SiteRoutes />} />
            <Route path="/zh/*" element={<SiteRoutes />} />
            <Route path="/*" element={<SiteRoutes />} />
          </Routes>
          <FloatingWhatsApp />
          <ScrollCTA />
          <MobileBottomCTA />
        </TooltipProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
