// Sends admin notifications via Resend (gateway) to ADMIN_EMAIL.
// Called from the public site (booking, contact, optional WA lead) — no JWT.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
const FROM = "TeknoKerja <onboarding@resend.dev>";

type NotifType = "booking" | "contact" | "whatsapp_lead";

interface Payload {
  type: NotifType;
  data: Record<string, unknown>;
}

const esc = (v: unknown) =>
  String(v ?? "—")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const renderRows = (data: Record<string, unknown>) =>
  Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#666;font-weight:600;white-space:nowrap">${esc(k)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#111">${esc(v)}</td></tr>`,
    )
    .join("");

const subjects: Record<NotifType, string> = {
  booking: "🟢 Booking baru — TeknoKerja",
  contact: "✉️ Form kontak baru — TeknoKerja",
  whatsapp_lead: "💬 WhatsApp lead baru — TeknoKerja",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY || !RESEND_API_KEY || !ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "missing_config" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Payload;
    if (!body?.type || !["booking", "contact", "whatsapp_lead"].includes(body.type)) {
      return new Response(JSON.stringify({ error: "invalid_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = body.data && typeof body.data === "object" ? body.data : {};
    const subject = subjects[body.type];
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff">
        <h2 style="color:#7C5CFF;margin:0 0 4px">${esc(subject)}</h2>
        <p style="color:#666;margin:0 0 16px;font-size:13px">${new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" })} WITA</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #eee;border-radius:8px;overflow:hidden">
          ${renderRows(data)}
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px">Notifikasi otomatis dari teknokerja.com</p>
      </div>`;

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({ from: FROM, to: [ADMIN_EMAIL], subject, html }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("[notify] resend error", res.status, result);
      return new Response(JSON.stringify({ error: "send_failed", detail: result }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[notify] threw", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
