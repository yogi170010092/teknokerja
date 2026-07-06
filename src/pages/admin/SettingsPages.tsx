import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { invalidateWebsiteSettings } from "@/hooks/useWebsiteSettings";

interface Setting {
  key: string;
  value: any;
}

// Centralised, typed field definitions per panel so we can render two
// curated forms (Website / SEO) on top of the same generic kv table.
type FieldType = "text" | "textarea" | "url";
interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  help?: string;
}

const WEBSITE_FIELDS: FieldDef[] = [
  { key: "site.brand_name", label: "Brand name", placeholder: "TeknoKerja" },
  { key: "site.whatsapp_number", label: "WhatsApp number", placeholder: "6283891088084", help: "Tanpa + atau spasi." },
  { key: "site.phone", label: "Display phone", placeholder: "+62 838-9108-8084" },
  { key: "site.contact_email", label: "Contact email", placeholder: "hello@teknokerja.com" },
  { key: "site.address", label: "Business address", type: "textarea", placeholder: "Jl. ..." },
  { key: "site.business_hours", label: "Business hours", placeholder: "Mon–Fri 09:00–18:00 · Sat 09:00–14:00" },
  { key: "site.google_maps_embed", label: "Google Maps embed URL", type: "url", help: "Optional. Override the default embed (use the `src` from Google Maps → Share → Embed)." },
  { key: "site.google_place_id", label: "Google Maps Place ID", placeholder: "ChIJ…", help: "Untuk Google Reviews di homepage (opsional)." },
  { key: "site.instagram_url", label: "Instagram URL", type: "url" },
  { key: "site.instagram_handle", label: "Instagram handle", placeholder: "@teknokerja" },
  { key: "site.tiktok_url", label: "TikTok URL", type: "url" },
  { key: "site.logo_url", label: "Logo URL", type: "url", help: "Path or full URL — used on emails and structured data." },
];

const SEO_FIELDS: FieldDef[] = [
  { key: "seo.default_title", label: "Default page title", placeholder: "TeknoKerja — Sewa Laptop di Bali" },
  { key: "seo.default_description", label: "Default meta description", type: "textarea" },
  { key: "seo.og_image_url", label: "Default Open Graph image", type: "url", placeholder: "https://…/og.jpg" },
  { key: "seo.gtm_id", label: "GTM container ID", placeholder: "GTM-XXXX" },
  { key: "seo.meta_pixel_id", label: "Meta Pixel ID" },
  { key: "seo.gsc_verification", label: "Google Search Console verification token" },
];

const useSettings = (fields: FieldDef[]) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const keys = fields.map((f) => f.key);
    supabase
      .from("website_settings")
      .select("key,value")
      .in("key", keys)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        const map: Record<string, string> = {};
        (data ?? []).forEach((r: Setting) => {
          map[r.key] = typeof r.value === "string" ? r.value : (r.value?.value ?? "");
        });
        setValues(map);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const rows = fields.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
    const { error } = await supabase
      .from("website_settings")
      .upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    invalidateWebsiteSettings();
    toast.success("Tersimpan");
  };

  return { values, setValues, loading, saving, save };
};

const SettingsForm = ({ title, hint, fields }: { title: string; hint: string; fields: FieldDef[] }) => {
  const { values, setValues, loading, saving, save } = useSettings(fields);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-headline">{title}</h1>
        <p className="text-sm text-caption">{hint}</p>
      </div>
      <Card className="p-6 space-y-5">
        {loading ? (
          <p className="text-sm text-caption">Loading…</p>
        ) : (
          fields.map((f) => (
            <div key={f.key}>
              <Label className="mb-1.5 block">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  rows={3}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                />
              ) : (
                <Input
                  type={f.type === "url" ? "url" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                />
              )}
              {f.help && <p className="text-xs text-caption mt-1">{f.help}</p>}
            </div>
          ))
        )}
        <div className="pt-2">
          <Button onClick={save} disabled={saving || loading}>
            <Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export const WebsiteSettingsPage = () => (
  <SettingsForm
    title="Website Settings"
    hint="Pengaturan kontak, sosial media, dan info bisnis global."
    fields={WEBSITE_FIELDS}
  />
);

export const SeoSettingsPage = () => (
  <SettingsForm
    title="SEO Settings"
    hint="Meta tag default, tracking IDs, dan verifikasi search engine."
    fields={SEO_FIELDS}
  />
);
