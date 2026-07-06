import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";

const AdminLayout = () => {
  const { loading, user, isAdmin, role, refreshRole, signOut } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-headline mb-2">Akses Ditolak</h1>
          <p className="text-body mb-1">Akun <strong>{user.email}</strong> tidak memiliki peran admin.</p>
          <p className="text-xs text-caption mb-4">user_id: {user.id} · role: {role ?? "null"}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => refreshRole()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Refresh role</button>
            <button onClick={() => signOut()} className="px-4 py-2 rounded-md border border-border text-sm">Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center gap-3 px-4 bg-card sticky top-0 z-30">
            <SidebarTrigger />
            <div className="text-sm font-semibold text-headline">TeknoKerja Admin</div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
