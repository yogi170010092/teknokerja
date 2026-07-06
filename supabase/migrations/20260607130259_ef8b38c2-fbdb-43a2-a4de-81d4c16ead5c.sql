
-- Revoke execute on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Tighten the "always true" insert policies with light validation
DROP POLICY IF EXISTS "anyone create booking" ON public.bookings;
CREATE POLICY "anyone create booking" ON public.bookings
  FOR INSERT
  WITH CHECK (
    length(trim(customer_name)) BETWEEN 2 AND 120
    AND length(trim(whatsapp)) BETWEEN 6 AND 32
    AND quantity BETWEEN 1 AND 50
  );

DROP POLICY IF EXISTS "anyone log lead" ON public.whatsapp_leads;
CREATE POLICY "anyone log lead" ON public.whatsapp_leads
  FOR INSERT
  WITH CHECK (
    event_type IN ('whatsapp_click','booking_submitted','contact_submitted','form_submitted')
    AND length(event_type) <= 64
  );
