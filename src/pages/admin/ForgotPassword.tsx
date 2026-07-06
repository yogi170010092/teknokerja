import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not send email", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg">
        <h1 className="text-xl font-bold text-headline mb-2">Reset password</h1>
        {sent ? (
          <p className="text-sm text-body">
            Cek inbox <span className="font-semibold">{email}</span> untuk tautan reset password.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-caption">Masukkan email Anda untuk menerima tautan reset.</p>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Send reset link
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm">
          <Link to="/admin/login" className="text-primary hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
