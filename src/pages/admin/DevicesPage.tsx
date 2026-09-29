import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowLeft, Battery, BellRing, CalendarDays, Clock3,
  ExternalLink, Globe2, History, Laptop, Loader2, LockKeyhole, MapPin,
  MessageSquareWarning, Navigation, RefreshCw, Search, ShieldCheck,
  UserRound, Wifi,
} from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  method?: string;
  created_at?: string;
}

interface Device {
  id: string;
  name: string;
  missing?: boolean;
  public_ip?: string;
  type?: string;
  description?: string;
  logged_user?: string;
  last_seen_on?: string;
  client_outdated?: boolean;
  client_version?: string;
  os_details?: { os?: string; os_version?: string; os_version_name?: string };
  location?: Location;
  network_status?: { last_known_ssid?: string; signal_strength?: number };
  device_details?: {
    battery_status?: { percentage_remaining?: string; time_remaining?: string; uptime?: string };
    hardware?: Array<{ name?: string; data?: Array<{ key?: string; value?: string }> }>;
  };
  labels?: Array<{ id?: string; name?: string }>;
  zones?: Array<{ id?: string; name?: string }>;
}

type DeviceAction = "refresh_location" | "alarm" | "alert" | "lock" | "unlock" | "missing";

const invokePrey = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke("prey-devices", { body });
  if (error) throw new Error(error.message || "Gagal menghubungi Prey");
  if (data?.error) throw new Error(data.error);
  return data as T;
};

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(value)) + " WITA"
  : "Belum tersedia";

const isOnline = (value?: string) => value
  ? Date.now() - new Date(value).getTime() < 15 * 60 * 1000
  : false;

const hasValue = (value: unknown) => value !== null && value !== undefined && value !== "";
const visibleText = (value?: string) => value && value.toLowerCase() !== "null" ? value : "—";
const batteryText = (device: Device) => {
  const value = device.device_details?.battery_status?.percentage_remaining;
  return hasValue(value) ? `${value}%` : "—";
};

const mapEmbedUrl = (location?: Location) => {
  if (!location) return "";
  const lat = Number(location.lat);
  const lng = Number(location.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  const spread = 0.012;
  const bbox = [lng - spread, lat - spread, lng + spread, lat + spread]
    .map((value) => value.toFixed(6)).join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const errorMessage = (error: unknown) => {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("prey_api_not_configured")) return "Secret PREY_API_KEY belum dipasang di Supabase.";
  if (raw.includes("admin_access_required")) return "Sesi admin tidak valid atau tidak memiliki akses.";
  if (raw.includes("prey_api_error")) return "Prey menolak permintaan. Periksa API key dan izin Read-nya.";
  return "Data perangkat belum bisa dimuat. Coba refresh beberapa saat lagi.";
};

const DevicesPage = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selected, setSelected] = useState<Device | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [deviceAction, setDeviceAction] = useState<DeviceAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [unlockPass, setUnlockPass] = useState("");
  const [closeApps, setCloseApps] = useState(false);

  const loadDevices = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await invokePrey<{ devices?: Device[] }>({ action: "list" });
      setDevices(data.devices ?? []);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDevices();
    const timer = window.setInterval(() => void loadDevices(true), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const openDevice = async (device: Device) => {
    setSelected(device);
    setLocations([]);
    setDetailLoading(true);
    try {
      const [detail, history] = await Promise.all([
        invokePrey<Device>({ action: "detail", deviceId: device.id }),
        invokePrey<{ latest_locations?: Location[] }>({ action: "locations", deviceId: device.id }),
      ]);
      setSelected(detail);
      setLocations(history.latest_locations ?? []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const runDeviceAction = async () => {
    if (!selected || !deviceAction || !isSuperAdmin) return;
    setActionLoading(true);
    try {
      const body: Record<string, unknown> = { action: deviceAction, deviceId: selected.id };
      if (deviceAction === "alert") body.message = alertMessage;
      if (deviceAction === "lock") {
        body.unlockPass = unlockPass;
        body.closeApps = closeApps;
      }
      if (deviceAction === "missing") body.missing = !selected.missing;
      await invokePrey(body);
      const labels: Record<DeviceAction, string> = {
        refresh_location: "Permintaan update lokasi dikirim",
        alarm: "Alarm berhasil dikirim",
        alert: "Pesan peringatan berhasil dikirim",
        lock: "Perintah screen lock berhasil dikirim",
        unlock: "Perintah unlock screen berhasil dikirim",
        missing: selected.missing ? "Device ditandai recovered" : "Device ditandai missing",
      };
      toast.success(labels[deviceAction]);
      setDeviceAction(null);
      setAlertMessage("");
      setUnlockPass("");
      setCloseApps(false);
      window.setTimeout(() => void openDevice(selected), 1500);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      toast.error(raw.includes("prey_write_error") ? "Prey menolak aksi. Pastikan API key memiliki izin Write." : "Aksi belum berhasil dikirim.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return devices;
    return devices.filter((device) => [device.name, device.logged_user, device.os_details?.os, device.public_ip]
      .some((value) => value?.toLowerCase().includes(needle)));
  }, [devices, query]);

  const online = devices.filter((device) => isOnline(device.last_seen_on)).length;
  const missing = devices.filter((device) => device.missing).length;
  const latestLocation = selected?.location ?? locations[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-headline">Device Monitoring</h1>
          <p className="text-sm text-caption">Status perangkat TeknoKerja dari Prey.</p>
        </div>
        <Button variant="outline" onClick={() => void loadDevices()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total device", value: devices.length, icon: Laptop, color: "text-primary" },
          { label: "Online 15 menit", value: online, icon: Wifi, color: "text-emerald-600" },
          { label: "Missing", value: missing, icon: AlertTriangle, color: "text-red-600" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-caption">{item.label}</p><p className="text-3xl font-bold">{loading ? "—" : item.value}</p></div>
              <item.icon className={`h-7 w-7 ${item.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Perangkat</CardTitle>{updatedAt && <p className="mt-1 text-xs text-caption">Diperbarui {formatDate(updatedAt.toISOString())}</p>}</div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-caption" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari device, user, IP..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-sm text-caption">Tidak ada perangkat yang ditemukan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-caption">
                  <th className="px-3 py-3">Device</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">OS</th>
                  <th className="px-3 py-3">User / jaringan</th><th className="px-3 py-3">Baterai</th><th className="px-3 py-3">Last seen</th>
                </tr></thead>
                <tbody>{filtered.map((device) => (
                  <tr key={device.id} onClick={() => void openDevice(device)} className="cursor-pointer border-b transition-colors hover:bg-muted/60">
                    <td className="px-3 py-4"><p className="font-semibold text-headline">{device.name}</p><p className="text-xs text-caption">{device.type ?? "Device"} · {device.client_version ?? "Prey —"}</p></td>
                    <td className="px-3 py-4"><div className="flex flex-wrap gap-1">
                      <Badge variant={isOnline(device.last_seen_on) ? "default" : "secondary"}>{isOnline(device.last_seen_on) ? "Online" : "Offline"}</Badge>
                      {device.missing && <Badge variant="destructive">Missing</Badge>}
                      {device.client_outdated && <Badge variant="outline">Update client</Badge>}
                    </div></td>
                    <td className="px-3 py-4">{device.os_details?.os ?? "—"}<p className="text-xs text-caption">{device.os_details?.os_version ?? ""}</p></td>
                    <td className="px-3 py-4">{visibleText(device.logged_user)}<p className="text-xs text-caption">{visibleText(device.network_status?.last_known_ssid) !== "—" ? device.network_status?.last_known_ssid : visibleText(device.public_ip)}</p></td>
                    <td className="px-3 py-4">{batteryText(device)}</td>
                    <td className="px-3 py-4 text-xs">{formatDate(device.last_seen_on)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-100" role="dialog" aria-label={`Monitoring ${selected.name}`}>
          {detailLoading ? (
            <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[330px_minmax(500px,1fr)_280px]">
              <aside className="border-r border-slate-200 bg-white p-5 xl:h-screen xl:overflow-y-auto">
                <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
                  <Button size="icon" variant="ghost" className="shrink-0" onClick={() => setSelected(null)} aria-label="Kembali ke daftar device">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold text-slate-900">{selected.name}</h2>
                    <div className={`mt-1 flex items-center gap-2 text-sm font-medium ${isOnline(selected.last_seen_on) ? "text-emerald-600" : "text-slate-500"}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${isOnline(selected.last_seen_on) ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {isOnline(selected.last_seen_on) ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>

                <div className="space-y-5 py-5">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{selected.description || selected.type || "Computer"}</p>
                    <p className="text-sm text-slate-500">Prey v{selected.client_version || "—"}</p>
                    <p className="mt-3 text-sm font-medium text-slate-700">Koneksi terakhir</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm"><CalendarDays className="h-4 w-4 text-slate-600" />{selected.last_seen_on ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Makassar" }).format(new Date(selected.last_seen_on)) : "—"}</span>
                      <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm"><Clock3 className="h-4 w-4 text-slate-600" />{selected.last_seen_on ? new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(new Date(selected.last_seen_on)) : "—"}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold text-slate-900">Informasi device</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm"><Laptop className="h-4 w-4" />{[selected.os_details?.os, selected.os_details?.os_version].filter(Boolean).join(" ") || "—"}</span>
                      <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm"><Wifi className="h-4 w-4" />Wi-Fi: {visibleText(selected.network_status?.last_known_ssid)}</span>
                      <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm"><UserRound className="h-4 w-4" />User: {visibleText(selected.logged_user)}</span>
                      <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm"><Battery className="h-4 w-4" />Baterai: {batteryText(selected)}</span>
                      <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm"><Globe2 className="h-4 w-4" />IP: {visibleText(selected.public_ip)}</span>
                    </div>
                  </div>

                  <div id="location-history">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900"><History className="h-4 w-4" />Riwayat lokasi</h3>
                    <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                      {locations.length ? locations.slice(0, 10).map((location, index) => (
                        <div key={`${location.created_at}-${index}`} className="border-l-2 border-blue-400 pl-3 text-sm">
                          <p className="font-medium text-slate-800">{formatDate(location.created_at)}</p>
                          <p className="text-xs text-slate-500">{Number(location.lat).toFixed(5)}, {Number(location.lng).toFixed(5)} · {location.method ?? "—"}</p>
                        </div>
                      )) : <p className="text-sm text-slate-500">Belum ada riwayat lokasi.</p>}
                    </div>
                  </div>
                </div>
              </aside>

              <main className="relative min-h-[620px] bg-slate-200 xl:h-screen">
                {latestLocation ? (
                  <iframe
                    title={`Peta lokasi ${selected.name}`}
                    src={mapEmbedUrl(latestLocation)}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full min-h-[620px] items-center justify-center text-slate-500"><MapPin className="mr-2 h-5 w-5" />Lokasi belum tersedia</div>
                )}

                {latestLocation && (
                  <div className="absolute left-1/2 top-6 z-10 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-white/70 bg-white/95 p-5 shadow-xl backdrop-blur">
                    <h3 className="text-xl font-bold text-slate-900">Perkiraan lokasi</h3>
                    <p className="mt-3 text-sm text-slate-600">Koordinat</p>
                    <p className="font-semibold text-slate-900">{Number(latestLocation.lat).toFixed(6)}, {Number(latestLocation.lng).toFixed(6)}</p>
                    <p className="mt-2 text-sm text-slate-600">Diperoleh {formatDate(latestLocation.created_at)}</p>
                    <p className="text-sm text-slate-600">Akurasi: {latestLocation.accuracy ? `${Math.round(latestLocation.accuracy)} m` : "—"}</p>
                    <div className="mt-4 grid gap-2">
                      <Button variant="outline" onClick={() => document.getElementById("location-history")?.scrollIntoView({ behavior: "smooth" })}>Riwayat lokasi</Button>
                      <Button asChild><a href={`https://www.google.com/maps/search/?api=1&query=${latestLocation.lat},${latestLocation.lng}`} target="_blank" rel="noreferrer"><Navigation className="mr-2 h-4 w-4" />Buka di Google Maps</a></Button>
                    </div>
                  </div>
                )}
              </main>

              <aside className="bg-[#0f3550] p-5 text-white xl:h-screen xl:overflow-y-auto">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Actions</h2>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setSelected(null)} aria-label="Tutup detail">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </div>

                <h3 className="mb-3 text-lg font-semibold">Status device</h3>
                <button disabled={!isSuperAdmin} onClick={() => setDeviceAction("missing")} className="mb-8 flex w-full items-center justify-between rounded-xl bg-white/10 p-4 text-left transition enabled:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60">
                  <span>{selected.missing ? "Set as Recovered" : "Set to Missing"}</span>
                  <ShieldCheck className={`h-5 w-5 ${selected.missing ? "text-red-300" : "text-emerald-300"}`} />
                </button>

                <h3 className="mb-3 text-lg font-semibold">Monitoring</h3>
                <div className="space-y-3">
                  <button disabled={!isSuperAdmin} onClick={() => setDeviceAction("refresh_location")} className="flex w-full items-center justify-between rounded-xl bg-[#2f80c2] p-4 text-left transition enabled:hover:bg-[#3a8fd2] disabled:cursor-not-allowed disabled:opacity-60">
                    <span>Update location</span><Navigation className="h-5 w-5" />
                  </button>
                  <button disabled={!isSuperAdmin} onClick={() => setDeviceAction("alarm")} className="flex w-full items-center justify-between rounded-xl bg-[#234b67] p-4 text-left transition enabled:hover:bg-[#2d5d7d] disabled:cursor-not-allowed disabled:opacity-60">
                    <span>Remote alarm</span><BellRing className="h-5 w-5" />
                  </button>
                  <button disabled={!isSuperAdmin} onClick={() => setDeviceAction("alert")} className="flex w-full items-center justify-between rounded-xl bg-[#234b67] p-4 text-left transition enabled:hover:bg-[#2d5d7d] disabled:cursor-not-allowed disabled:opacity-60">
                    <span>Alert message</span><MessageSquareWarning className="h-5 w-5" />
                  </button>
                  <button disabled={!isSuperAdmin} onClick={() => setDeviceAction("lock")} className="flex w-full items-center justify-between rounded-xl bg-[#234b67] p-4 text-left transition enabled:hover:bg-[#2d5d7d] disabled:cursor-not-allowed disabled:opacity-60">
                    <span>Screen lock</span><LockKeyhole className="h-5 w-5" />
                  </button>
                  <button disabled={!isSuperAdmin} onClick={() => setDeviceAction("unlock")} className="flex w-full items-center justify-between rounded-xl bg-emerald-700 p-4 text-left transition enabled:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">
                    <span>Unlock screen</span><LockKeyhole className="h-5 w-5" />
                  </button>
                  <button onClick={() => document.getElementById("location-history")?.scrollIntoView({ behavior: "smooth" })} className="flex w-full items-center justify-between rounded-xl bg-[#234b67] p-4 text-left transition hover:bg-[#2d5d7d]">
                    <span>Riwayat lokasi</span><History className="h-5 w-5" />
                  </button>
                  {latestLocation && <a href={`https://www.google.com/maps/search/?api=1&query=${latestLocation.lat},${latestLocation.lng}`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-between rounded-xl bg-[#2f80c2] p-4 transition hover:bg-[#3a8fd2]"><span>Buka peta</span><ExternalLink className="h-5 w-5" /></a>}
                </div>

                {!isSuperAdmin && <div className="mt-10 rounded-xl border border-white/15 bg-white/5 p-4 text-xs leading-relaxed text-blue-100">Aksi keamanan hanya tersedia untuk Super Admin.</div>}
              </aside>
            </div>
          )}

          <Dialog open={deviceAction !== null} onOpenChange={(open) => !open && !actionLoading && setDeviceAction(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{deviceAction === "alarm" ? "Aktifkan remote alarm?" : deviceAction === "alert" ? "Kirim alert message" : deviceAction === "lock" ? "Kunci layar device" : deviceAction === "unlock" ? "Buka screen lock device?" : deviceAction === "missing" ? (selected.missing ? "Tandai sebagai recovered?" : "Tandai device sebagai missing?") : "Minta update lokasi?"}</DialogTitle>
                <DialogDescription>Aksi ini akan dikirim langsung ke <strong>{selected.name}</strong>{isOnline(selected.last_seen_on) ? "." : " dan diproses ketika device kembali online."}</DialogDescription>
              </DialogHeader>

              {deviceAction === "alert" && <div className="space-y-2"><Label htmlFor="alert-message">Pesan yang ditampilkan</Label><Input id="alert-message" value={alertMessage} onChange={(event) => setAlertMessage(event.target.value)} maxLength={300} placeholder="Contoh: Hubungi admin TeknoKerja" /></div>}
              {deviceAction === "lock" && <div className="space-y-4"><div className="space-y-2"><Label htmlFor="unlock-pass">Password unlock</Label><Input id="unlock-pass" type="password" value={unlockPass} onChange={(event) => setUnlockPass(event.target.value)} minLength={4} maxLength={32} placeholder="Minimal 4 karakter" /></div><label className="flex items-center gap-2 text-sm"><Checkbox checked={closeApps} onCheckedChange={(checked) => setCloseApps(checked === true)} />Tutup aplikasi yang sedang terbuka</label></div>}
              {deviceAction === "missing" && !selected.missing && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Missing mode akan mengaktifkan pengumpulan laporan bukti dan lokasi oleh Prey.</div>}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDeviceAction(null)} disabled={actionLoading}>Batal</Button>
                <Button
                  variant={deviceAction === "missing" && !selected.missing ? "destructive" : "default"}
                  onClick={() => void runDeviceAction()}
                  disabled={actionLoading || (deviceAction === "alert" && !alertMessage.trim()) || (deviceAction === "lock" && unlockPass.trim().length < 4)}
                >
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Kirim aksi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
