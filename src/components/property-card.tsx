import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/store";
import type { Property } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  property: Property;
  onFavorite?: () => void;
  isFavorite?: boolean;
  href?: string;
}

export function PropertyCard({ property, onFavorite, isFavorite, href }: Props) {
  const inner = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <img
          src={property.images[0]}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">{property.type}</Badge>
          {property.featured && (
            <Badge className="bg-accent text-accent-foreground">Featured</Badge>
          )}
        </div>
        {onFavorite && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFavorite(); }}
            aria-label="Toggle favorite"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition hover:scale-105"
          >
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-accent text-accent" : "text-foreground/70")} />
          </button>
        )}
        <div className="absolute bottom-3 right-3 rounded-full bg-background/95 px-3 py-1 text-sm font-semibold backdrop-blur">
          {formatPrice(property.price)}
        </div>
      </div>
      <div className="space-y-1 px-1 pt-3">
        <h3 className="font-display text-lg leading-tight">{property.title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{property.location}</span>
        </div>
        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          {property.bedrooms > 0 && <span>{property.bedrooms} bd</span>}
          {property.bathrooms > 0 && <span>{property.bathrooms} ba</span>}
          <span>{property.area_size.toLocaleString()} sqft</span>
        </div>
      </div>
    </>
  );

  return href ? (
    <Link to={href} className="group block">{inner}</Link>
  ) : (
    <div className="group">{inner}</div>
  );
}
