import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "../supabase";

export default defineTool({
  name: "get_laptop",
  title: "Get laptop details",
  description: "Fetch full details for a single laptop by its id, including gallery images and pricing.",
  inputSchema: {
    id: z.string().uuid().describe("Laptop id (UUID) from list_laptops."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const { data, error } = await sb().from("laptops").select("*").eq("id", id).maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Laptop not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { laptop: data },
    };
  },
});
