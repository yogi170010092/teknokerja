/**
 * Lead tracking helpers — persist WhatsApp clicks and booking requests to
 * Lovable Cloud so the admin dashboard can act on them. All calls are
 * fire-and-forget; failures never block the UX (analytics still fires).
 */
import { supabase } from "@/integrations/supabase/client";

export type LeadEventType =
  | "whatsapp_click"
  | "booking_submitted"
  | "contact_submitted"
  | "form_submitted";

export interface LogLeadParams {
  event_type: LeadEventType;
  location?: string;
  service_category?: string;
  locale?: string;
}

export const logLead = (params: LogLeadParams) => {
  try {
    void supabase
      .from("whatsapp_leads")
      .insert({
        event_type: params.event_type,
        location: params.location ?? null,
        service_category: params.service_category ?? null,
        locale: params.locale ?? null,
        page_path: typeof window !== "undefined" ? window.location.pathname : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      })
      .then(({ error }) => {
        if (error) console.warn("[leads] log failed:", error.message);
      });
  } catch (e) {
    console.warn("[leads] log threw:", e);
  }
};

export interface CreateBookingParams {
  customer_name: string;
  whatsapp: string;
  email?: string | null;
  laptop_id?: string | null;
  laptop_name?: string | null;
  quantity?: number;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  locale?: string | null;
  source_page?: string | null;
}

export const createBooking = async (params: CreateBookingParams) => {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_name: params.customer_name.trim(),
      whatsapp: params.whatsapp.trim(),
      email: params.email?.trim() || null,
      laptop_id: params.laptop_id ?? null,
      laptop_name: params.laptop_name ?? null,
      quantity: params.quantity ?? 1,
      start_date: params.start_date ?? null,
      end_date: params.end_date ?? null,
      notes: params.notes ?? null,
      locale: params.locale ?? null,
      source_page:
        params.source_page ??
        (typeof window !== "undefined" ? window.location.pathname : null),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
};
