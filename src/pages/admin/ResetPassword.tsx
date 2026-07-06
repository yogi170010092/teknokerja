import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Password tidak sama", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password minimal 8 karakter", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Password diperbarui" });
    nav("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg">
        <h1 className="text-xl font-bold text-headline mb-4">Set password baru</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pw">Password baru</Label>
            <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="pw2">Konfirmasi password</Label>
            <Input id="pw2" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Update password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
