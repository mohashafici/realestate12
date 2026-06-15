import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Home, BedDouble, Star, Inbox, BadgeDollarSign, ArrowRight } from "lucide-react";
import { useApp, formatPrice } from "@/lib/store";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const Route = createFileRoute("/agent/")({
  component: AgentDashboard,
});

function AgentDashboard() {
  const properties = useApp((s) => s.properties);
  const inquiries = useApp((s) => s.inquiries);
  const users = useApp((s) => s.users);

  const total = properties.length;
  const available = properties.filter((p) => p.status === "Available").length;
  const rented = properties.filter((p) => p.status === "Rented").length;
  const sold = properties.filter((p) => p.status === "Sold").length;
  const featured = properties.filter((p) => p.featured).length;

  const recentProps = [...properties].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 5);
  const recentInq = [...inquiries].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">A snapshot of your portfolio and pipeline.</p>
        </div>
        <Link to="/agent/properties/new" className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">+ Add property</Link>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Properties" value={total} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Available" value={available} icon={<Home className="h-5 w-5" />} tone="success" />
        <StatCard label="Rented" value={rented} icon={<BedDouble className="h-5 w-5" />} tone="warning" />
        <StatCard label="Sold" value={sold} icon={<BadgeDollarSign className="h-5 w-5" />} tone="destructive" />
        <StatCard label="Featured" value={featured} icon={<Star className="h-5 w-5" />} tone="accent" />
        <StatCard label="Inquiries" value={inquiries.length} icon={<Inbox className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-display text-xl">Recent properties</h2>
            <Link to="/agent/properties" className="text-sm text-accent hover:underline">View all <ArrowRight className="inline h-3.5 w-3.5" /></Link>
          </div>
          <ul className="divide-y divide-border">
            {recentProps.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-4">
                <img src={p.images[0]} alt="" className="h-14 w-20 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.location} · {p.type}</div>
                </div>
                <div className="hidden text-sm sm:block">{formatPrice(p.price)}</div>
                <Badge variant="secondary">{p.status}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-display text-xl">Recent inquiries</h2>
            <Link to="/agent/inquiries" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-border">
            {recentInq.length === 0 && <li className="p-6 text-sm text-muted-foreground">No inquiries yet.</li>}
            {recentInq.map((i) => {
              const buyer = users.find((u) => u.id === i.buyer_id);
              const prop = properties.find((p) => p.id === i.property_id);
              return (
                <li key={i.id} className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">{buyer?.full_name ?? "Unknown"}</div>
                    <Badge variant={i.status === "Pending" ? "default" : i.status === "Read" ? "secondary" : "outline"}>{i.status}</Badge>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{prop?.title} · {format(new Date(i.created_at), "MMM d")}</div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{i.message}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
