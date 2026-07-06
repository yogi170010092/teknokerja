import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/uploadImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Star, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  customer_name: string;
  company: string | null;
  location: string | null;
  laptop_rented: string | null;
  rating: number;
  comment: string | null;
  screenshot_url: string | null;
  testimonial_date: string | null;
  published: boolean;
  sort_order: number;
}

const empty: Partial<Testimonial> = {
  customer_name: "",
  company: "",
  location: "",
  laptop_rented: "",
  rating: 5,
  comment: "",
  screenshot_url: "",
  testimonial_date: null,
  published: true,
  sort_order: 0,
};

const TestimonialsAdmin = () => {
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Testimonial>>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage("testimonials", file);
      setEditing((cur) => ({ ...cur, screenshot_url: url }));
      toast.success("Screenshot uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Testimonial[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.customer_name) { toast.error("Nama wajib diisi"); return; }
    setSaving(true);
    const payload: any = {
      customer_name: editing.customer_name,
      company: editing.company || null,
      location: editing.location || null,
      laptop_rented: editing.laptop_rented || null,
      rating: Math.max(1, Math.min(5, Number(editing.rating ?? 5))),
      comment: editing.comment || null,
      screenshot_url: editing.screenshot_url || null,
      testimonial_date: editing.testimonial_date || null,
      published: editing.published ?? true,
      sort_order: Number(editing.sort_order ?? 0),
    };
    const { error } = editing.id
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Diperbarui" : "Ditambahkan");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Dihapus");
    load();
  };

  const togglePublish = async (r: Testimonial) => {
    const { error } = await supabase.from("testimonials").update({ published: !r.published }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-headline">Testimonials</h1>
          <p className="text-sm text-caption">Kelola review pelanggan untuk homepage & SEO AggregateRating.</p>
        </div>
        <Button onClick={() => { setEditing({ ...empty }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />New testimonial
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Rating</th>
              <th className="p-3 font-medium">Comment</th>
              <th className="p-3 font-medium">Published</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-caption">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-caption">Belum ada testimonial.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-3">
                  <div className="font-medium text-headline">{r.customer_name}</div>
                  <div className="text-xs text-caption">{[r.company, r.location].filter(Boolean).join(" · ")}</div>
                </td>
                <td className="p-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted"}`} />
                    ))}
                  </div>
                </td>
                <td className="p-3 text-caption max-w-md line-clamp-2">{r.comment ?? "—"}</td>
                <td className="p-3">
                  <Switch checked={r.published} onCheckedChange={() => togglePublish(r)} />
                </td>
                <td className="p-3 text-caption">{r.sort_order}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditing(r); setOpen(true); }} className="p-1.5 hover:bg-muted rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(r.id)} className="p-1.5 hover:bg-muted rounded text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.id ? "Edit testimonial" : "New testimonial"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Customer name</Label>
                <Input value={editing.customer_name ?? ""} onChange={(e) => setEditing({ ...editing, customer_name: e.target.value })} />
              </div>
              <div>
                <Label>Company / role</Label>
                <Input value={editing.company ?? ""} onChange={(e) => setEditing({ ...editing, company: e.target.value })} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Canggu, Bali" />
              </div>
              <div>
                <Label>Laptop rented</Label>
                <Input value={editing.laptop_rented ?? ""} onChange={(e) => setEditing({ ...editing, laptop_rented: e.target.value })} />
              </div>
              <div>
                <Label>Rating (1–5)</Label>
                <Input type="number" min={1} max={5} value={editing.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <Label>WhatsApp screenshot</Label>
                <div className="flex items-start gap-3 mt-1.5">
                  {editing.screenshot_url ? (
                    <div className="relative">
                      <img src={editing.screenshot_url} alt="Preview" className="w-24 h-32 object-cover rounded-lg border border-border" />
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, screenshot_url: "" })}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:opacity-90"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted text-caption text-xs">
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      {uploading ? "Uploading…" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(f);
                        }}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <Input
                      value={editing.screenshot_url ?? ""}
                      onChange={(e) => setEditing({ ...editing, screenshot_url: e.target.value })}
                      placeholder="…or paste URL https://"
                    />
                    <p className="text-xs text-caption mt-1.5">Upload a WhatsApp screenshot (JPG/PNG). Shown as the main visual on the homepage.</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Testimonial date</Label>
                <Input type="date" value={editing.testimonial_date ?? ""} onChange={(e) => setEditing({ ...editing, testimonial_date: e.target.value })} />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <Switch checked={editing.published ?? true} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
                <Label className="!mb-0">Published</Label>
              </div>
            </div>
            <div>
              <Label>Comment</Label>
              <Textarea rows={5} value={editing.comment ?? ""} onChange={(e) => setEditing({ ...editing, comment: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsAdmin;
