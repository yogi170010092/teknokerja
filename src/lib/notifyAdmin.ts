/**
 * Fire-and-forget admin email notifications via the
 * `send-admin-notification` edge function. Never blocks UX.
 */
import { supabase } from "@/integrations/supabase/client";

export type NotifyType = "booking" | "contact" | "whatsapp_lead";

export const notifyAdmin = (type: NotifyType, data: Record<string, unknown>) => {
  try {
    void supabase.functions
      .invoke("send-admin-notification", { body: { type, data } })
      .then(({ error }) => {
        if (error) console.warn("[notifyAdmin]", type, error.message);
      });
  } catch (e) {
    console.warn("[notifyAdmin] threw", e);
  }
};
