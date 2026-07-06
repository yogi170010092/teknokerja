
-- ============== ENUMS ==============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'staff');
CREATE TYPE public.laptop_status AS ENUM ('ready','rented','maintenance','out_of_stock');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','active','completed','cancelled');
CREATE TYPE public.article_status AS ENUM ('draft','published');

-- ============== SHARED FUNCTIONS ==============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============== PROFILES ==============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== USER ROLES ==============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','staff'))
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "super admin sees all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admin writes roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admin updates roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admin deletes roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

-- ============== LAPTOPS ==============
CREATE TABLE public.laptops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  processor text,
  ram text,
  ssd text,
  vga text,
  screen_size text,
  price_daily integer,
  price_weekly integer,
  price_monthly integer,
  status public.laptop_status NOT NULL DEFAULT 'ready',
  photo_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.laptops TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.laptops TO authenticated;
GRANT ALL ON public.laptops TO service_role;
ALTER TABLE public.laptops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read laptops" ON public.laptops FOR SELECT USING (true);
CREATE POLICY "admin manage laptops" ON public.laptops FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_laptops_upd BEFORE UPDATE ON public.laptops FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== BOOKINGS ==============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  whatsapp text NOT NULL,
  email text,
  laptop_id uuid REFERENCES public.laptops(id) ON DELETE SET NULL,
  laptop_name text,
  quantity integer NOT NULL DEFAULT 1,
  start_date date,
  end_date date,
  notes text,
  status public.booking_status NOT NULL DEFAULT 'pending',
  locale text,
  source_page text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone create booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "super admin delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_bookings_upd BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== TESTIMONIALS ==============
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  company text,
  location text,
  laptop_rented text,
  rating smallint NOT NULL DEFAULT 5,
  comment text,
  screenshot_url text,
  testimonial_date date,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published testi" ON public.testimonials FOR SELECT USING (published = true);
CREATE POLICY "admin read all testi" ON public.testimonials FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin manage testi" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_testi_upd BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== ARTICLES ==============
CREATE TABLE public.article_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.article_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.article_categories TO authenticated;
GRANT ALL ON public.article_categories TO service_role;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read cats" ON public.article_categories FOR SELECT USING (true);
CREATE POLICY "admin manage cats" ON public.article_categories FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  meta_title text,
  meta_description text,
  featured_image text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  content text,
  excerpt text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.article_categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  locale text NOT NULL DEFAULT 'en',
  status public.article_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published articles" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "admin read all articles" ON public.articles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin manage articles" ON public.articles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_articles_upd BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_status_pub ON public.articles(status, published_at DESC);

-- ============== WHATSAPP LEADS ==============
CREATE TABLE public.whatsapp_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  location text,
  service_category text,
  locale text,
  page_path text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.whatsapp_leads TO anon, authenticated;
GRANT SELECT, DELETE ON public.whatsapp_leads TO authenticated;
GRANT ALL ON public.whatsapp_leads TO service_role;
ALTER TABLE public.whatsapp_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone log lead" ON public.whatsapp_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read leads" ON public.whatsapp_leads FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX idx_leads_created ON public.whatsapp_leads(created_at DESC);

-- ============== ACTIVITY LOGS ==============
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT, SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()) AND user_id = auth.uid());
CREATE INDEX idx_logs_created ON public.activity_logs(created_at DESC);

-- ============== WEBSITE SETTINGS ==============
CREATE TABLE public.website_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT ON public.website_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.website_settings TO authenticated;
GRANT ALL ON public.website_settings TO service_role;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "super admin manage settings" ON public.website_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_settings_upd BEFORE UPDATE ON public.website_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
