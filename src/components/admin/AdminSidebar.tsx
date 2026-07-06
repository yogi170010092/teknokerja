import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Inbox, Laptop, Star, FileText, Search, Settings,
  Users, ScrollText, LogOut, Calendar, Instagram,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const main = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Booking Requests", url: "/admin/bookings", icon: Inbox },
  { title: "Calendar", url: "/admin/calendar", icon: Calendar },
  { title: "Laptop Stock", url: "/admin/laptops", icon: Laptop },
  { title: "Testimonials", url: "/admin/testimonials", icon: Star },
  { title: "Instagram Gallery", url: "/admin/instagram", icon: Instagram },
  { title: "Articles", url: "/admin/articles", icon: FileText },
  { title: "WhatsApp Leads", url: "/admin/leads", icon: Search },
];
const sysSuper = [
  { title: "SEO Settings", url: "/admin/seo", icon: Search },
  { title: "Website Settings", url: "/admin/settings", icon: Settings },
  { title: "Users & Roles", url: "/admin/users", icon: Users },
];
const sysAll = [
  { title: "Activity Logs", url: "/admin/logs", icon: ScrollText },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { signOut, isSuperAdmin, user, role } = useAdminAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await signOut();
    nav("/admin/login", { replace: true });
  };

  const renderItems = (items: typeof main) =>
    items.map((it) => {
      const active = it.end ? pathname === it.url : pathname.startsWith(it.url);
      return (
        <SidebarMenuItem key={it.url}>
          <SidebarMenuButton asChild isActive={active}>
            <NavLink to={it.url} end={it.end} className="flex items-center gap-2">
              <it.icon className="h-4 w-4" />
              {!collapsed && <span>{it.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(main)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isSuperAdmin && renderItems(sysSuper)}
              {renderItems(sysAll)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-3">
        {!collapsed && (
          <div className="text-xs text-caption mb-2 truncate">
            {user?.email}
            <div className="text-[10px] uppercase tracking-wider text-primary">{role}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-body hover:text-headline w-full px-2 py-1.5 rounded-md hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};
