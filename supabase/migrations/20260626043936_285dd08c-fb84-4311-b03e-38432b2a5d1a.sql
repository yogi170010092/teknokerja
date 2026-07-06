CREATE TABLE public.instagram_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt_text text,
  link_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.instagram_gallery TO anon, authenticated;
GRANT ALL ON public.instagram_gallery TO authenticated, service_role;
ALTER TABLE public.instagram_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published" ON public.instagram_gallery FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage all" ON public.instagram_gallery FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER set_instagram_gallery_updated_at BEFORE UPDATE ON public.instagram_gallery FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();