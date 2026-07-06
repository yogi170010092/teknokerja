import { defineTool } from "@lovable.dev/mcp-js";
import { sb } from "../supabase";

export default defineTool({
  name: "get_contact_info",
  title: "Get contact info",
  description:
    "Return TeknoKerja's public contact details (WhatsApp, email, address, hours) and website settings.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await sb().from("website_settings").select("*").limit(1).maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const info = {
      whatsapp: "+62 838-9108-8084",
      whatsapp_link: "https://wa.me/6283891088084",
      email: "iklansatu7@gmail.com",
      address: "Jl. Tukad Yeh Biu No.29, Sesetan, Denpasar Selatan, Bali 80225",
      hours: "Mon–Fri 09:00–18:00, Sat 09:00–14:00 (WITA)",
      website: "https://teknokerja.com",
      settings: data ?? null,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
