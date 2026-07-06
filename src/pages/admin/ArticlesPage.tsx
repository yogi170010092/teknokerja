import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/uploadImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ExternalLink, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  tags: string[];
  created_at: string;
}

const empty: Partial<Article> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  meta_title: "",
  meta_description: "",
  locale: "en",
  status: "draft",
  tags: [],
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

const ArticlesAdmin = () => {
  const [rows, setRows] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Article>>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFeaturedUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage("articles", file);
      setEditing((cur) => ({ ...cur, featured_image: url }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Article[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing({ ...empty }); setOpen(true); };
  const startEdit = (r: Article) => { setEditing({ ...r }); setOpen(true); };

  const save = async () => {
    if (!editing.title || !editing.slug) {
      toast.error("Title dan slug wajib diisi");
      return;
    }
    setSaving(true);
    const payload: any = {
      title: editing.title,
      slug: editing.slug,
      excerpt: editing.excerpt || null,
      content: editing.content || null,
      featured_image: editing.featured_image || null,
      meta_title: editing.meta_title || null,
      meta_description: editing.meta_description || null,
      locale: editing.locale || "en",
      status: editing.status || "draft",
      tags: editing.tags || [],
      published_at:
        editing.status === "published"
          ? editing.published_at || new Date().toISOString()
          : null,
    };

    const { error } = editing.id
      ? await supabase.from("articles").update(payload).eq("id", editing.id)
      : await supabase.from("articles").insert(payload);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Artikel diperbarui" : "Artikel dibuat");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus artikel ini?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Dihapus");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-headline">Articles</h1>
          <p className="text-sm text-caption">Kelola blog artikel & SEO konten.</p>
        </div>
        <Button onClick={startNew}><Plus className="w-4 h-4 mr-2" />New article</Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Slug</th>
              <th className="p-3 font-medium">Locale</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Published</th>
              <th className="p-3 font-medium w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-caption">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-caption">Belum ada artikel.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium text-headline">{r.title}</td>
                <td className="p-3 text-caption">{r.slug}</td>
                <td className="p-3 uppercase text-xs">{r.locale}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === "published" ? "bg-green-100 text-green-700" : r.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-muted text-caption"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-xs text-caption">{r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {r.status === "published" && (
                      <a href={`/blog/${r.slug}`} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-muted rounded" title="View"><ExternalLink className="w-4 h-4" /></a>
                    )}
                    <button onClick={() => startEdit(r)} className="p-1.5 hover:bg-muted rounded" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(r.id)} className="p-1.5 hover:bg-muted rounded text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Edit article" : "New article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({
                    ...editing,
                    title: e.target.value,
                    slug: !editing.id && !editing.slug ? slugify(e.target.value) : editing.slug,
                  })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
              </div>
              <div>
                <Label>Locale</Label>
                <Select value={editing.locale ?? "en"} onValueChange={(v) => setEditing({ ...editing, locale: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="id">Indonesian</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status ?? "draft"} onValueChange={(v: any) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Featured image</Label>
                <div className="flex items-start gap-3 mt-1.5">
                  {editing.featured_image ? (
                    <div className="relative">
                      <img src={editing.featured_image} alt="Preview" className="w-32 h-20 object-cover rounded-lg border border-border" />
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, featured_image: "" })}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:opacity-90"
                        aria-label="Remove"
                      ><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="w-32 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted text-caption text-xs">
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      {uploading ? "Uploading…" : "Upload"}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFeaturedUpload(f); }} />
                    </label>
                  )}
                  <div className="flex-1">
                    <Input value={editing.featured_image ?? ""} onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })} placeholder="…or paste URL https://" />
                    <p className="text-xs text-caption mt-1.5">Used as og:image and the blog cover.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
            </div>
            <div>
              <Label>Content (HTML)</Label>
              <Textarea rows={12} value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="<p>Article body…</p>" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Meta title</Label>
                <Input value={editing.meta_title ?? ""} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} />
              </div>
              <div>
                <Label>Meta description</Label>
                <Input value={editing.meta_description ?? ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
              </div>
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

export default ArticlesAdmin;
