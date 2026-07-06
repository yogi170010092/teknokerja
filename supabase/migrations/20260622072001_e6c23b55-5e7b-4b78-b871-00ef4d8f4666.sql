
-- Public read on the three media buckets (needed so signed URLs resolve for anon visitors)
CREATE POLICY "Public read laptops bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'laptops');

CREATE POLICY "Public read testimonials bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'testimonials');

CREATE POLICY "Public read articles bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'articles');

-- Admin-only writes
CREATE POLICY "Admins upload to laptops"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'laptops' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins update laptops"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'laptops' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins delete laptops"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'laptops' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins upload to testimonials"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'testimonials' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins update testimonials"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'testimonials' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins delete testimonials"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'testimonials' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins upload to articles"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'articles' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins update articles"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'articles' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins delete articles"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'articles' AND public.is_admin(auth.uid()));
