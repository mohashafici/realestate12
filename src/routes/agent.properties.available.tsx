import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { PropertyCard } from "@/components/property-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/agent/properties/available")({
  component: AvailableProperties,
});

function AvailableProperties() {
  const properties = useApp((s) => s.properties);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [loc, setLoc] = useState("all");

  const locations = useMemo(() => Array.from(new Set(properties.map((p) => p.location))), [properties]);

  const list = properties.filter((p) =>
    p.status === "Available" &&
    (!q || p.title.toLowerCase().includes(q.toLowerCase())) &&
    (type === "all" || p.type === type) &&
    (loc === "all" || p.location === loc)
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Available properties</h1>
        <p className="text-sm text-muted-foreground">Listings currently on the market.</p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={loc} onValueChange={setLoc}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {["House","Apartment","Villa","Land","Office"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No matching available properties" description="Try clearing filters." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <PropertyCard key={p.id} property={p} href={`/buyer/properties/${p.id}`} />)}
        </div>
      )}
    </div>
  );
}
