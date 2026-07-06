import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import Index from "./pages/Index";
import Tentang from "./pages/Tentang";
import Kontak from "./pages/Kontak";
import SewaLaptop from "./pages/SewaLaptop";
import LaptopStock from "./pages/LaptopStock";
import SyaratKetentuan from "./pages/SyaratKetentuan";
import HowItWorks from "./pages/HowItWorks";
import FAQPage from "./pages/FAQ";
import Blog, { BlogPost } from "./pages/Blog";
import LocationLanding from "./pages/LocationLanding";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import FloatingWhatsApp from "./components/interactive/FloatingWhatsApp";
import ScrollCTA from "./components/interactive/ScrollCTA";
import MobileBottomCTA from "./components/interactive/MobileBottomCTA";
import FloatingLanguageSwitcher from "./components/interactive/FloatingLanguageSwitcher";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminForgotPassword from "./pages/admin/ForgotPassword";
import AdminResetPassword from "./pages/admin/ResetPassword";
import AdminOverview from "./pages/admin/Overview";
import AdminBookings from "./pages/admin/BookingsPage";
import AdminCalendar from "./pages/admin/CalendarPage";
import AdminLaptops from "./pages/admin/LaptopsPage";
import AdminUsers from "./pages/admin/UsersPage";
import ArticlesPage from "./pages/admin/ArticlesPage";
import TestimonialsAdmin from "./pages/admin/TestimonialsPage";
import InstagramAdmin from "./pages/admin/InstagramPage";
import { WebsiteSettingsPage, SeoSettingsPage } from "./pages/admin/SettingsPages";
import { LeadsPage, LogsPage } from "./pages/admin/SimpleListPages";

const queryClient = new QueryClient();

const SiteRoutes = () => (
  <Routes>
    <Route index element={<Index />} />
    <Route path="sewa-laptop" element={<SewaLaptop />} />
    <Route path="laptops" element={<LaptopStock />} />
    <Route path="laptop-stock" element={<LaptopStock />} />
    <Route path="tentang" element={<Tentang />} />
    <Route path="kontak" element={<Kontak />} />
    <Route path="syarat-ketentuan" element={<SyaratKetentuan />} />
    <Route path="how-it-works" element={<HowItWorks />} />
    <Route path="faq" element={<FAQPage />} />
    <Route path="blog" element={<Blog />} />
    <Route path="blog/:slug" element={<BlogPost />} />
    <Route path="reviews" element={<Reviews />} />
    <Route path="laptop-rental-:slug" element={<LocationLanding />} />
    <Route path="artikel/*" element={<Navigate to="/blog" replace />} />
    <Route path="kategori/*" element={<Navigate to="/blog" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const PublicChrome = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <FloatingWhatsApp />
      <FloatingLanguageSwitcher />
      <ScrollCTA />
      <MobileBottomCTA />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AdminAuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ScrollToTop />
            <Routes>
              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="calendar" element={<AdminCalendar />} />
                <Route path="laptops" element={<AdminLaptops />} />
                <Route path="testimonials" element={<TestimonialsAdmin />} />
                <Route path="instagram" element={<InstagramAdmin />} />
                <Route path="articles" element={<ArticlesPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="logs" element={<LogsPage />} />
                <Route path="seo" element={<SeoSettingsPage />} />
                <Route path="settings" element={<WebsiteSettingsPage />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              {/* Public site */}
              <Route path="/id/*" element={<SiteRoutes />} />
              <Route path="/ru/*" element={<SiteRoutes />} />
              <Route path="/zh/*" element={<SiteRoutes />} />
              <Route path="/*" element={<SiteRoutes />} />
            </Routes>
            <PublicChrome />
          </TooltipProvider>
        </LanguageProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
