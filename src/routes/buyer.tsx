import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Menu, X, LogOut } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer")({
  ssr: false,
  component: BuyerLayout,
});

const links = [
  { to: "/buyer", label: "Home", exact: true },
  { to: "/buyer/properties", label: "Available" },
  { to: "/buyer/favorites", label: "Favorites" },
  { to: "/buyer/inquiries", label: "My Inquiries" },
  { to: "/buyer/profile", label: "Profile" },
];

function BuyerLayout() {
  const navigate = useNavigate();
  const user = useApp((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
  const logout = useApp((s) => s.logout);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/auth/login", replace: true });
    else if (user.role !== "buyer") navigate({ to: "/agent", replace: true });
  }, [user, navigate]);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (!user || user.role !== "buyer") return null;

  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  function handleLogout() { logout(); navigate({ to: "/auth/login", replace: true }); }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/buyer" className="flex items-center gap-2 font-display text-xl">
            <Building2 className="h-5 w-5 text-accent" /> Estata
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                className={cn("rounded-full px-4 py-2 text-sm transition",
                  isActive(l.to, l.exact) ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-muted-foreground">Hi, {user.full_name.split(" ")[0]}</span>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
          <button className="rounded-md p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to}
                  className={cn("rounded-lg px-3 py-2 text-sm",
                    isActive(l.to, l.exact) ? "bg-foreground text-background" : "hover:bg-muted")}>
                  {l.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
