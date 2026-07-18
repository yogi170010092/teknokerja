import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Role = "super_admin" | "staff" | null;

interface AdminAuthCtx {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const Ctx = createContext<AdminAuthCtx | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  const loadRole = async (uid: string | undefined) => {
    if (!uid) {
      console.log("[AdminAuth] loadRole: no uid, clearing role");
      setRole(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    if (error) {
      console.error("[AdminAuth] loadRole error:", error);
      setRole(null);
      setRoleLoading(false);
      return;
    }
    const roles = (data ?? []).map((r) => r.role as Role);
    const next: Role = roles.includes("super_admin")
      ? "super_admin"
      : roles.includes("staff")
        ? "staff"
        : null;
    console.log("[AdminAuth] USER_ID", uid, "rows:", data, "ROLE", next);
    setRole(next);
    setRoleLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((evt, s) => {
      console.log("[AdminAuth] onAuthStateChange", evt, "user:", s?.user?.id);
      setSession(s);
      setUser(s?.user ?? null);

      // Hanya reload role kalau user ID-nya benar-benar berubah (login/logout beneran),
      // BUKAN setiap kali token di-refresh diam-diam pas tab balik fokus.
      setUser((prevUser) => {
        if (prevUser?.id !== s?.user?.id) {
          setTimeout(() => loadRole(s?.user?.id), 0);
        }
        return s?.user ?? null;
      });
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      console.log("[AdminAuth] getSession user:", s?.user?.id);
      setRoleLoading(!!s?.user);
      setSession(s);
      setUser(s?.user ?? null);
      loadRole(s?.user?.id).finally(() => setAuthLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  const refreshRole = async () => {
    await loadRole(user?.id);
  };

  const isAdmin = role === "super_admin" || role === "staff";
  const isSuperAdmin = role === "super_admin";
  const loading = authLoading || roleLoading;

  console.log("USER_ID", user?.id);
  console.log("ROLE", role);
  console.log("IS_ADMIN", isAdmin);
  console.log("[AdminAuth] state →", {
    userId: user?.id,
    role,
    isAdmin,
    loading,
  });

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        role,
        loading,
        isAdmin,
        isSuperAdmin,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAdminAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return v;
};
