import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/property-card";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/buyer/properties/")({
  component: BrowseProperties,
});

function BrowseProperties() {
  const properties = useApp((s) => s.properties);
  const userId = useApp((s) => s.currentUserId);
  const favorites = useApp((s) => s.favorites);
  const toggle = useApp((s) => s.toggleFavorite);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [loc, setLoc] = useState("all");
  const [price, setPrice] = useState("all");

  const locations = useMemo(() => Array.from(new Set(properties.map((p) => p.location))), [properties]);
  const inRange = (p: number) => {
    if (price === "all") return true;
    if (price === "0-500k") return p < 500000;
    if (price === "500k-1m") return p >= 500000 && p < 1000000;
    if (price === "1m-2m") return p >= 1000000 && p < 2000000;
    if (price === "2m+") return p >= 2000000;
    return true;
  };
  const list = properties.filter((p) =>
    p.status === "Available" &&
    (!q || p.title.toLowerCase().includes(q.toLowerCase())) &&
    (type === "all" || p.type === type) &&
    (loc === "all" || p.location === loc) &&
    inRange(p.price)
  );

  const isFav = (id: string) => userId ? favorites.some((f) => f.buyer_id === userId && f.property_id === id) : false;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Available properties</h1>
        <p className="text-sm text-muted-foreground">{list.length} listings on the market</p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {["House","Apartment","Villa","Land","Office"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={loc} onValueChange={setLoc}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={price} onValueChange={setPrice}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Price" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any price</SelectItem>
            <SelectItem value="0-500k">Under $500k</SelectItem>
            <SelectItem value="500k-1m">$500k – $1M</SelectItem>
            <SelectItem value="1m-2m">$1M – $2M</SelectItem>
            <SelectItem value="2m+">$2M+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="Nothing matches yet" description="Try widening your filters." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <PropertyCard key={p.id} property={p} href={`/buyer/properties/${p.id}`}
              isFavorite={isFav(p.id)} onFavorite={() => userId && toggle(userId, p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
