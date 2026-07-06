import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "../supabase";

export default defineTool({
  name: "get_article",
  title: "Get article by slug",
  description: "Fetch a published blog article by its slug (and optional locale).",
  inputSchema: {
    slug: z.string().min(1).describe("Article slug, e.g. 'sewa-laptop-bali'."),
    locale: z.enum(["en", "id", "ru", "zh"]).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug, locale }) => {
    let q = sb().from("articles").select("*").eq("slug", slug).eq("status", "published").limit(1);
    if (locale) q = q.eq("locale", locale);
    const { data, error } = await q.maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Article not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { article: data },
    };
  },
});
