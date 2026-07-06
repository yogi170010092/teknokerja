import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "../supabase";

export default defineTool({
  name: "list_laptops",
  title: "List laptops",
  description:
    "List laptops available for rent at TeknoKerja Bali. Returns name, brand, specs, daily/weekly/monthly prices (IDR), and status.",
  inputSchema: {
    status: z
      .enum(["ready", "rented", "maintenance", "any"])
      .default("ready")
      .describe("Filter by availability status. Default 'ready' = bookable now."),
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }) => {
    let q = sb()
      .from("laptops")
      .select("id,name,brand,processor,ram,ssd,vga,screen_size,price_daily,price_weekly,price_monthly,status,photo_url,notes")
      .order("sort_order", { ascending: true })
      .limit(limit);
    if (status !== "any") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { laptops: data ?? [] },
    };
  },
});
