import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useApp } from "@/lib/store";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/buyer/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const userId = useApp((s) => s.currentUserId);
  const favorites = useApp((s) => s.favorites.filter((f) => f.buyer_id === userId));
  const properties = useApp((s) => s.properties);
  const toggle = useApp((s) => s.toggleFavorite);
  const list = favorites.map((f) => properties.find((p) => p.id === f.property_id)).filter(Boolean) as typeof properties;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Favorites</h1>
        <p className="text-sm text-muted-foreground">{list.length} saved properties</p>
      </header>
      {list.length === 0 ? (
        <EmptyState icon={<Heart className="h-5 w-5" />} title="No favorites yet"
          description="Tap the heart icon on any property to save it here."
          action={<Link to="/buyer/properties"><Button>Browse properties</Button></Link>} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <div key={p.id} className="space-y-2">
              <PropertyCard property={p} href={`/buyer/properties/${p.id}`} isFavorite onFavorite={() => { userId && toggle(userId, p.id); toast.success("Removed from favorites"); }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
