import { createClient } from "@supabase/supabase-js";

// Lazy client — read env at call time (module is evaluated at build/cold-start
// where env may not yet be present). Uses the PUBLIC anon key; RLS on the
// public tables gates what these read-only MCP tools can see, matching what
// the website itself shows to anonymous visitors.
declare const Deno: { env: { get(k: string): string | undefined } } | undefined;

function env(k: string): string | undefined {
  if (typeof Deno !== "undefined") return Deno.env.get(k);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: any = (globalThis as any).process;
  return p?.env?.[k];
}

export function sb() {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_PUBLISHABLE_KEY") ?? env("SUPABASE_ANON_KEY");
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
