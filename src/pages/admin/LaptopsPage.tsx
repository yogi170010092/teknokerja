import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/uploadImage";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { Plus, Trash2, Upload, Loader2, ImageIcon, Pencil } from "lucide-react";

type Laptop = Database["public"]["Tables"]["laptops"]["Row"];
type LStatus = Database["public"]["Enums"]["laptop_status"];

const statuses: LStatus[] = ["ready", "rented", "maintenance", "out_of_stock"];

const emptyForm = { name: "", brand: "", processor: "", ram: "", price_daily: "", photo_url: "" };

const LaptopsPage = () => {
  const [items, setItems] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingRow, setUploadingRow] = useState<string | null>(null);
  const rowInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // --- Edit dialog state ---
  const [editingItem, setEditingItem] = useState<Laptop | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("laptops").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: LStatus) => {
    const { error } = await supabase.from("laptops").update({ status }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    setItems((arr) => arr.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus laptop ini?")) return;
    const { error } = await supabase.from("laptops").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    setItems((arr) => arr.filter((l) => l.id !== id));
  };

  const handleNewUpload = async (file: File) => {
    setUploadingNew(true);
    try {
      const url = await uploadImage("laptops", file);
      setForm((f) => ({ ...f, photo_url: url }));
      toast({ title: "Image uploaded" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploadingNew(false); }
  };

  const handleRowUpload = async (id: string, file: File) => {
    setUploadingRow(id);
    try {
      const url = await uploadImage("laptops", file);
      const { error } = await supabase.from("laptops").update({ photo_url: url }).eq("id", id);
      if (error) throw error;
      setItems((arr) => arr.map((l) => (l.id === id ? { ...l, photo_url: url } : l)));
      toast({ title: "Image updated" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploadingRow(null); }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, brand: form.brand || null,
      processor: form.processor || null, ram: form.ram || null,
      price_daily: form.price_daily ? Number(form.price_daily) : null,
      photo_url: form.photo_url || null,
    };
    const { error } = await supabase.from("laptops").insert(payload);
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Laptop ditambahkan" });
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  // --- Edit handlers ---
  const openEdit = (item: Laptop) => {
    setEditingItem(item);
    setEditForm({
      name: item.name ?? "",
      brand: item.brand ?? "",
      processor: item.processor ?? "",
      ram: item.ram ?? "",
      price_daily: item.price_daily?.toString() ?? "",
      photo_url: item.photo_url ?? "",
    });
  };

  const closeEdit = () => {
    setEditingItem(null);
    setEditForm(emptyForm);
  };

  const handleEditUpload = async (file: File) => {
    setUploadingEdit(true);
    try {
      const url = await uploadImage("laptops", file);
      setEditForm((f) => ({ ...f, photo_url: url }));
      toast({ title: "Image uploaded" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploadingEdit(false); }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSavingEdit(true);
    const payload = {
      name: editForm.name,
      brand: editForm.brand || null,
      processor: editForm.processor || null,
      ram: editForm.ram || null,
      price_daily: editForm.price_daily ? Number(editForm.price_daily) : null,
      photo_url: editForm.photo_url || null,
    };

    const { error } = await supabase.from("laptops").update(payload).eq("id", editingItem.id);
    setSavingEdit(false);

    if (error) {
      return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }

    toast({ title: "Laptop berhasil diupdate" });
    setItems((arr) => arr.map((l) => (l.id === editingItem.id ? { ...l, ...payload } : l)));
    closeEdit();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-headline">Laptop Stock</h1>
          <p className="text-sm text-caption">{loading ? "Memuat…" : `${items.length} laptop`}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} size="sm">
          <Plus className="w-4 h-4" /> {showForm ? "Tutup" : "Tambah Laptop"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><Label>Nama *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="mt-1" /></div>
            <div><Label>Processor</Label><Input value={form.processor} onChange={(e) => setForm({ ...form, processor: e.target.value })} className="mt-1" /></div>
            <div><Label>RAM</Label><Input value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} className="mt-1" /></div>
            <div><Label>Harga Harian (Rp)</Label><Input type="number" value={form.price_daily} onChange={(e) => setForm({ ...form, price_daily: e.target.value })} className="mt-1" /></div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label>Foto laptop</Label>
              <div className="flex items-start gap-3 mt-1.5">
                {form.photo_url ? (
                  <div className="relative">
                    <img src={form.photo_url} alt="Preview" className="w-28 h-20 object-cover rounded-lg border border-border" />
                    <button type="button" onClick={() => setForm({ ...form, photo_url: "" })}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:opacity-90"
                      aria-label="Remove"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-28 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted text-caption text-xs">
                    {uploadingNew ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {uploadingNew ? "Uploading…" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingNew}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleNewUpload(f); }} />
                  </label>
                )}
                <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="…or paste URL https://" className="flex-1" />
              </div>
            </div>
            <div className="flex items-end md:col-span-2 lg:col-span-3"><Button type="submit" className="w-full md:w-auto">Simpan</Button></div>
          </form>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 font-medium w-20">Foto</th>
              <th className="p-3 font-medium">Nama</th>
              <th className="p-3 font-medium">Brand</th>
              <th className="p-3 font-medium">Spek</th>
              <th className="p-3 font-medium">Harga/hari</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr><td colSpan={7} className="p-8 text-center text-caption">Belum ada laptop. Klik "Tambah Laptop".</td></tr>
            )}
            {items.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => rowInputs.current[l.id]?.click()}
                    className="relative w-14 h-14 rounded-md border border-border overflow-hidden bg-muted flex items-center justify-center group"
                    title="Ganti foto"
                  >
                    {l.photo_url ? (
                      <img src={l.photo_url} alt={l.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-caption" />
                    )}
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      {uploadingRow === l.id
                        ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                        : <Upload className="w-4 h-4 text-white" />}
                    </span>
                    <input
                      ref={(el) => { rowInputs.current[l.id] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRowUpload(l.id, f); e.target.value = ""; }}
                    />
                  </button>
                </td>
                <td className="p-3 font-medium text-headline">{l.name}</td>
                <td className="p-3">{l.brand ?? "—"}</td>
                <td className="p-3 text-xs text-caption">{[l.processor, l.ram, l.ssd].filter(Boolean).join(" • ") || "—"}</td>
                <td className="p-3">{l.price_daily ? `Rp ${l.price_daily.toLocaleString("id-ID")}` : "—"}</td>
                <td className="p-3">
                  <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as LStatus)}>
                    <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(l)} title="Edit">
                      <Pencil className="w-4 h-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(l.id)} title="Hapus">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* --- Edit Dialog --- */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Laptop</DialogTitle>
          </DialogHeader>

          <form onSubmit={saveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Nama *</Label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Brand</Label>
                <Input
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Processor</Label>
                <Input
                  value={editForm.processor}
                  onChange={(e) => setEditForm({ ...editForm, processor: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>RAM</Label>
                <Input
                  value={editForm.ram}
                  onChange={(e) => setEditForm({ ...editForm, ram: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Harga Harian (Rp)</Label>
                <Input
                  type="number"
                  value={editForm.price_daily}
                  onChange={(e) => setEditForm({ ...editForm, price_daily: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Foto laptop</Label>
              <div className="flex items-start gap-3 mt-1.5">
                {editForm.photo_url ? (
                  <div className="relative">
                    <img src={editForm.photo_url} alt="Preview" className="w-28 h-20 object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, photo_url: "" })}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:opacity-90"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-28 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted text-caption text-xs">
                    {uploadingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {uploadingEdit ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingEdit}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleEditUpload(f); }}
                    />
                  </label>
                )}
                <Input
                  value={editForm.photo_url}
                  onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })}
                  placeholder="…or paste URL https://"
                  className="flex-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEdit}>
                Batal
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LaptopsPage;