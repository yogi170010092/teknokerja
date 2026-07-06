CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'staff')
  )
$$;

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated;

DROP POLICY IF EXISTS "super admin sees all roles" ON public.user_roles;
CREATE POLICY "super admin sees all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "super admin writes roles" ON public.user_roles;
CREATE POLICY "super admin writes roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "super admin updates roles" ON public.user_roles;
CREATE POLICY "super admin updates roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "super admin deletes roles" ON public.user_roles;
CREATE POLICY "super admin deletes roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "admin manage laptops" ON public.laptops;
CREATE POLICY "admin manage laptops" ON public.laptops
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read bookings" ON public.bookings;
CREATE POLICY "admin read bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin update bookings" ON public.bookings;
CREATE POLICY "admin update bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "super admin delete bookings" ON public.bookings;
CREATE POLICY "super admin delete bookings" ON public.bookings
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "admin read all testi" ON public.testimonials;
CREATE POLICY "admin read all testi" ON public.testimonials
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin manage testi" ON public.testimonials;
CREATE POLICY "admin manage testi" ON public.testimonials
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin manage cats" ON public.article_categories;
CREATE POLICY "admin manage cats" ON public.article_categories
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read all articles" ON public.articles;
CREATE POLICY "admin read all articles" ON public.articles
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin manage articles" ON public.articles;
CREATE POLICY "admin manage articles" ON public.articles
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read leads" ON public.whatsapp_leads;
CREATE POLICY "admin read leads" ON public.whatsapp_leads
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin read logs" ON public.activity_logs;
CREATE POLICY "admin read logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin insert logs" ON public.activity_logs;
CREATE POLICY "admin insert logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (private.is_admin(auth.uid()) AND user_id = auth.uid());

DROP POLICY IF EXISTS "super admin manage settings" ON public.website_settings;
CREATE POLICY "super admin manage settings" ON public.website_settings
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;