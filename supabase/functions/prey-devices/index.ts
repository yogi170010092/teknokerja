import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PREY_API_URL = "https://api.preyproject.com/v1";
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const requireAdmin = async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!token || !supabaseUrl || !serviceRoleKey) return null;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
  if (userError || !user) return null;

  const { data: roles, error: roleError } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["super_admin", "staff"]);

  if (roleError || !roles?.length) return null;
  return { user, isSuperAdmin: roles.some((item) => item.role === "super_admin") };
};

const safeDeviceId = (value: unknown) => {
  const id = String(value ?? "");
  return /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
};

const normalizeSsid = (value: unknown) => {
  const ssid = String(value ?? "").trim();
  if (!ssid || ssid.toLowerCase() === "null") return null;
  try { return decodeURIComponent(ssid.replace(/\+/g, "%20")).trim(); }
  catch { return ssid; }
};

const latestSsid = async (deviceId: string, preyApiKey: string) => {
  try {
    const response = await fetch(
      `${PREY_API_URL}/devices/${deviceId}/reports?page=1&page_size=1`,
      { headers: { apikey: preyApiKey, Accept: "application/json" }, signal: AbortSignal.timeout(10_000) },
    );
    if (!response.ok) return null;
    const data = await response.json();
    return normalizeSsid(data?.reports?.[0]?.active_access_point?.ssid);
  } catch {
    return null;
  }
};

const enrichDeviceWifi = async (device: Record<string, unknown>, preyApiKey: string) => {
  const network = device?.network_status as Record<string, unknown> | undefined;
  const currentSsid = normalizeSsid(network?.last_known_ssid);
  const fallbackSsid = currentSsid || await latestSsid(String(device.id), preyApiKey);
  return {
    ...device,
    network_status: { ...(network ?? {}), last_known_ssid: fallbackSsid },
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "method_not_allowed" }, 405);

  try {
    const admin = await requireAdmin(req);
    if (!admin) return respond({ error: "admin_access_required" }, 403);

    const preyApiKey = Deno.env.get("PREY_API_KEY");
    if (!preyApiKey) return respond({ error: "prey_api_not_configured" }, 503);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "list");
    const deviceId = action === "list" ? null : safeDeviceId(body?.deviceId);

    const writeActions = ["refresh_location", "alarm", "alert", "lock", "unlock", "missing"];
    if (writeActions.includes(action)) {
      if (!admin.isSuperAdmin) return respond({ error: "super_admin_required" }, 403);
      if (!deviceId) return respond({ error: "invalid_device" }, 400);

      let path: string;
      let payload: Record<string, unknown>;
      if (action === "refresh_location") {
        path = `/devices/${deviceId}/request`;
        payload = { action_name: "location" };
      } else if (action === "missing") {
        path = `/devices/${deviceId}/missing`;
        payload = { missing: body?.missing === true };
      } else {
        path = `/devices/${deviceId}/action`;
        if (action === "alarm") {
          payload = { command: "start", action_name: "alarm", options: { sound: "alarm" } };
        } else if (action === "alert") {
          const message = String(body?.message ?? "").trim().slice(0, 300);
          if (!message) return respond({ error: "message_required" }, 400);
          payload = { command: "start", action_name: "alert", options: { alert_message: message } };
        } else if (action === "unlock") {
          payload = { command: "stop", action_name: "lock", options: {} };
        } else {
          const unlockPass = String(body?.unlockPass ?? "").trim();
          if (unlockPass.length < 4 || unlockPass.length > 32) return respond({ error: "invalid_unlock_password" }, 400);
          payload = { command: "start", action_name: "lock", options: { unlock_pass: unlockPass, close_apps: body?.closeApps === true } };
        }
      }

      const upstream = await fetch(`${PREY_API_URL}${path}`, {
        method: "PUT",
        headers: { apikey: preyApiKey, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      });
      const result = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        console.error("[prey-devices] write upstream", upstream.status, result);
        return respond({ error: "prey_write_error", status: upstream.status }, upstream.status === 401 ? 502 : upstream.status);
      }
      return respond({ ok: true, action, result });
    }

    let path: string;
    if (action === "list") {
      path = "/devices?page=1&page_size=100";
    } else if (action === "detail" && deviceId) {
      path = `/devices/${deviceId}`;
    } else if (action === "locations" && deviceId) {
      path = `/devices/${deviceId}/location_activity?page=1&page_size=100`;
    } else {
      return respond({ error: "invalid_request" }, 400);
    }

    const upstream = await fetch(`${PREY_API_URL}${path}`, {
      headers: { apikey: preyApiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    const raw = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(raw); } catch { data = { message: raw || "Invalid response" }; }

    if (!upstream.ok) {
      console.error("[prey-devices] upstream", upstream.status, data);
      const status = upstream.status === 401 ? 502 : upstream.status;
      return respond({ error: "prey_api_error", status: upstream.status }, status);
    }

    if (action === "list" && Array.isArray(data?.devices)) {
      const devices = await Promise.all(
        data.devices.map((device: Record<string, unknown>) => enrichDeviceWifi(device, preyApiKey)),
      );
      return respond({ ...data, devices });
    }
    if (action === "detail" && data && typeof data === "object") {
      return respond(await enrichDeviceWifi(data as Record<string, unknown>, preyApiKey));
    }
    return respond(data);
  } catch (error) {
    console.error("[prey-devices]", error);
    const message = error instanceof DOMException && error.name === "TimeoutError"
      ? "prey_api_timeout"
      : "unexpected_error";
    return respond({ error: message }, 500);
  }
});
