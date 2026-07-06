import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/uploadImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2, Instagram } from "lucide-react";
import { toast } from "sonner";

interface IgItem {
  id: string;
  image_url: string;
  alt_text: string | null;
  link_url: string | null;
  sort_order: number;
  is_published: boolean;
}

const empty: Partial<IgItem> = {
  image_url: "",
  alt_text: "",
  link_url: "",
  sort_order: 0,
  is_published: true,
};

const InstagramAdmin = () => {
  const [rows, setRows] = useState<IgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<IgItem>>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("instagram_gallery")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as IgItem[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage("instagram", file);
      setEditing((cur) => ({ ...cur, image_url: url }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!editing.image_url) { toast.error("Image is required"); return; }
    setSaving(true);
    const payload: any = {
      image_url: editing.image_url,
      alt_text: editing.alt_text || null,
      link_url: editing.link_url || null,
      sort_order: editing.sort_order ?? 0,
      is_published: editing.is_published ?? true,
    };
    const res = editing.id
      ? await supabase.from("instagram_gallery").update(payload).eq("id", editing.id)
      : await supabase.from("instagram_gallery").insert(payload);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved");
    setOpen(false);
    setEditing(empty);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    const { error } = await supabase.from("instagram_gallery").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-headline flex items-center gap-2">
            <Instagram className="w-6 h-6" /> Instagram Gallery
          </h1>
          <p className="text-sm text-caption">Manage images shown in the homepage Instagram section.</p>
        </div>
        <Button onClick={() => { setEditing(empty); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add image
        </Button>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-caption"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-caption">No images yet. Click "Add image" to upload one.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {rows.map((r) => (
              <div key={r.id} className="relative group">
                <img src={r.image_url} alt={r.alt_text ?? ""} className="aspect-square w-full object-cover rounded-lg bg-muted" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-lg">
                  <Button size="sm" variant="secondary" onClick={() => { setEditing(r); setOpen(true); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {!r.is_published && (
                  <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white">Hidden</span>
                )}
                <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">#{r.sort_order}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Edit image" : "Add image"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Image</Label>
              {editing.image_url && (
                <img src={editing.image_url} alt="" className="w-full aspect-square object-cover rounded-md mb-2 bg-muted" />
              )}
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input cursor-pointer hover:bg-muted text-sm">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              </label>
            </div>
            <div>
              <Label>Alt text (for SEO/accessibility)</Label>
              <Input value={editing.alt_text ?? ""} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} placeholder="MacBook setup in Canggu villa" />
            </div>
            <div>
              <Label>Link URL (optional)</Label>
              <Input value={editing.link_url ?? ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} placeholder="https://instagram.com/p/..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-2">
                <Switch checked={editing.is_published ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
                <Label>Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstagramAdmin;
