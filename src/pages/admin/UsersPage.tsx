import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Role = Database["public"]["Enums"]["app_role"];

interface Row {
  id: string;
  user_id: string;
  role: Role;
  email: string | null;
  full_name: string | null;
}

const UsersPage = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [grantRole, setGrantRole] = useState<Role>("staff");

  const load = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("id,user_id,role").order("created_at");
    const ids = (roles ?? []).map((r) => r.user_id);
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("id,email,full_name").in("id", ids)
      : { data: [] as any[] };
    const merged: Row[] = (roles ?? []).map((r) => {
      const p = (profiles ?? []).find((x: any) => x.id === r.user_id);
      return { id: r.id, user_id: r.user_id, role: r.role as Role, email: p?.email ?? null, full_name: p?.full_name ?? null };
    });
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (!isSuperAdmin) return <Navigate to="/admin" replace />;

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: profile } = await supabase
      .from("profiles").select("id").eq("email", searchEmail.trim()).maybeSingle();
    if (!profile) {
      toast({ title: "User tidak ditemukan", description: "Pastikan email tersebut sudah signup di Lovable Cloud → Users.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: profile.id, role: grantRole });
    if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
    toast({ title: "Role diberikan" });
    setSearchEmail("");
    load();
  };

  const revoke = async (id: string) => {
    if (!confirm("Cabut role ini?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-headline">Users &amp; Roles</h1>
        <p className="text-sm text-caption">Berikan peran admin pada user yang sudah signup.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={grant} className="grid grid-cols-1 md:grid-cols-[1fr_180px_120px] gap-3 items-end">
          <div>
            <Label>Email user</Label>
            <Input required type="email" placeholder="email user yang sudah signup" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={grantRole} onValueChange={(v) => setGrantRole(v as Role)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Berikan</Button>
        </form>
        <p className="text-xs text-caption mt-3">
          Cara membuat user baru: buka Lovable Cloud → Users → Add user (set password), lalu kembali ke sini dan berikan role.
        </p>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Nama</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr><td colSpan={4} className="p-8 text-center text-caption">Belum ada admin terdaftar.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">{r.email ?? r.user_id}</td>
                <td className="p-3">{r.full_name ?? "—"}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{r.role}</span></td>
                <td className="p-3"><Button variant="ghost" size="icon" onClick={() => revoke(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default UsersPage;
