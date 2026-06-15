import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/property-card";

export const Route = createFileRoute("/buyer/")({
  component: BuyerHome,
});

function BuyerHome() {
  const properties = useApp((s) => s.properties);
  const userId = useApp((s) => s.currentUserId);
  const favorites = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("all");

  const locations = useMemo(() => Array.from(new Set(properties.map((p) => p.location))), [properties]);
  const featured = properties.filter((p) => p.featured);
  const latest = [...properties].filter((p) => p.status === "Available")
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (loc !== "all") params.set("loc", loc);
    navigate({ to: "/buyer/properties", search: { q: q || undefined, loc: loc !== "all" ? loc : undefined } as any });
  }

  const isFav = (id: string) => userId ? favorites.some((f) => f.buyer_id === userId && f.property_id === id) : false;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=70" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="relative grid gap-8 p-8 md:grid-cols-2 md:p-14">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">Now on Estata</span>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">Homes worth slowing down for.</h1>
            <p className="mt-4 max-w-md text-muted-foreground">Browse curated listings from independent agents. Save the ones you love. Start a conversation.</p>
            <form onSubmit={onSearch} className="mt-6 flex flex-col gap-2 rounded-2xl border border-border bg-background p-2 shadow-soft sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="border-0 pl-9 focus-visible:ring-0" placeholder="Search by title…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <Select value={loc} onValueChange={setLoc}>
                <SelectTrigger className="border-0 sm:w-48"><SelectValue placeholder="Any location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any location</SelectItem>
                  {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-accent text-accent-foreground hover:opacity-90">Search</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl">Featured properties</h2>
              <p className="text-sm text-muted-foreground">Hand-picked listings.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} href={`/buyer/properties/${p.id}`}
                isFavorite={isFav(p.id)} onFavorite={() => userId && toggleFavorite(userId, p.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl">Latest available</h2>
            <p className="text-sm text-muted-foreground">Fresh on the market.</p>
          </div>
          <a className="hidden text-sm text-accent hover:underline md:inline-flex md:items-center md:gap-1" href="/buyer/properties">Browse all <ArrowRight className="h-3.5 w-3.5" /></a>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {latest.map((p) => (
            <PropertyCard key={p.id} property={p} href={`/buyer/properties/${p.id}`}
              isFavorite={isFav(p.id)} onFavorite={() => userId && toggleFavorite(userId, p.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
