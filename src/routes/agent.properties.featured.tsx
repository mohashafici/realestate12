import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useApp, formatPrice } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/agent/properties/featured")({
  component: FeaturedProperties,
});

function FeaturedProperties() {
  const list = useApp((s) => s.properties.filter((p) => p.featured));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Featured properties</h1>
        <p className="text-sm text-muted-foreground">Highlighted on the buyer home page.</p>
      </header>

      {list.length === 0 ? (
        <EmptyState icon={<Star className="h-5 w-5" />} title="No featured properties yet"
          description="Toggle the star icon on a property to feature it." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <img src={p.images[0]} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg leading-tight">{p.title}</h3>
                  <Badge variant="secondary">{p.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{p.location}</div>
                <div className="font-medium">{formatPrice(p.price)}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
