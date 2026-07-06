
-- 1) activity_logs: constrain user_email to authenticated user's email
DROP POLICY IF EXISTS "admin insert logs" ON public.activity_logs;
CREATE POLICY "admin insert logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    private.is_admin(auth.uid())
    AND user_id = auth.uid()
    AND (user_email IS NULL OR lower(user_email) = lower(((auth.jwt() ->> 'email'))))
  );

-- 2) bookings realtime: restrict realtime.messages reads to admins
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins only realtime messages" ON realtime.messages;
CREATE POLICY "Admins only realtime messages" ON realtime.messages
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

-- 3) Revoke EXECUTE on public schema role-check functions to prevent enumeration.
--    Policies use private.has_role / private.is_admin already.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;

-- Update storage.objects policies that still reference public.is_admin to use private.is_admin
DROP POLICY IF EXISTS "Admins delete articles" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete laptops" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete testimonials" ON storage.objects;
DROP POLICY IF EXISTS "Admins update articles" ON storage.objects;
DROP POLICY IF EXISTS "Admins update laptops" ON storage.objects;
DROP POLICY IF EXISTS "Admins update testimonials" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload to articles" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload to laptops" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload to testimonials" ON storage.objects;

CREATE POLICY "Admins delete articles" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'articles' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins delete laptops" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'laptops' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins delete testimonials" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'testimonials' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins update articles" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'articles' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins update laptops" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'laptops' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins update testimonials" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'testimonials' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins upload to articles" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'articles' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins upload to laptops" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'laptops' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins upload to testimonials" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'testimonials' AND private.is_admin(auth.uid()));
