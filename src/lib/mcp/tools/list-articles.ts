import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "../supabase";

export default defineTool({
  name: "list_articles",
  title: "List blog articles",
  description: "List published blog articles from TeknoKerja. Filter by locale (en/id/ru/zh).",
  inputSchema: {
    locale: z.enum(["en", "id", "ru", "zh"]).optional().describe("Language filter."),
    limit: z.number().int().min(1).max(50).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ locale, limit }) => {
    let q = sb()
      .from("articles")
      .select("id,slug,title,excerpt,locale,tags,published_at,featured_image")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (locale) q = q.eq("locale", locale);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { articles: data ?? [] },
    };
  },
});
