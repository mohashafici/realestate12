import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Building2, Home, Star, Inbox, BarChart3, User2, LogOut, Menu, X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agent")({
  ssr: false,
  component: AgentLayout,
});

const items = [
  { to: "/agent", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/agent/properties", label: "Properties", icon: Building2 },
  { to: "/agent/properties/available", label: "Available", icon: Home },
  { to: "/agent/properties/featured", label: "Featured", icon: Star },
  { to: "/agent/inquiries", label: "Inquiries", icon: Inbox },
  { to: "/agent/reports", label: "Reports", icon: BarChart3 },
  { to: "/agent/profile", label: "Profile", icon: User2 },
];

function AgentLayout() {
  const navigate = useNavigate();
  const ready = useApp((s) => s.ready);
  const userId = useApp((s) => s.currentUserId);
  const user = useApp((s) => s.users.find((u) => u.id === userId) ?? null);
  const logout = useApp((s) => s.logout);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!userId) navigate({ to: "/auth/login", replace: true });
    else if (user && user.role !== "agent") navigate({ to: "/buyer", replace: true });
  }, [ready, userId, user, navigate]);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (!ready || !user || user.role !== "agent") return null;

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  async function handleLogout() {
    await logout();
    navigate({ to: "/auth/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/agent" className="flex items-center gap-2 font-display text-lg"><Building2 className="h-5 w-5 text-accent" /> Estata</Link>
        <button onClick={() => setOpen((o) => !o)} className="rounded-md p-2 hover:bg-muted" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center gap-2 px-6 py-6 font-display text-2xl">
            <Building2 className="h-6 w-6 text-accent" /> Estata
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {items.map((it) => {
              const active = isActive(it.to, it.exact);
              return (
                <Link key={it.to} to={it.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}>
                  <it.icon className="h-4 w-4" /> {it.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-3">
            <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground font-medium">{user.full_name[0]}</div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{user.full_name}</div>
                <div className="truncate text-xs text-sidebar-foreground/60">{user.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
