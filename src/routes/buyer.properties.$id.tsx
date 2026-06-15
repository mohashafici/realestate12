import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, MapPin, BedDouble, Bath, Ruler, ArrowLeft, Send } from "lucide-react";
import { useApp, formatPrice } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/properties/$id")({
  component: PropertyDetails,
});

function PropertyDetails() {
  const { id } = useParams({ from: "/buyer/properties/$id" });
  const property = useApp((s) => s.properties.find((p) => p.id === id));
  const userId = useApp((s) => s.currentUserId);
  const isFav = useApp((s) => userId ? s.favorites.some((f) => f.buyer_id === userId && f.property_id === id) : false);
  const toggle = useApp((s) => s.toggleFavorite);
  const addInquiry = useApp((s) => s.addInquiry);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  if (!property) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl">Property not found</h1>
        <Link to="/buyer/properties" className="mt-3 inline-block text-accent hover:underline">Back to listings</Link>
      </div>
    );
  }

  function sendInquiry() {
    if (!userId) return;
    if (msg.trim().length < 5) return toast.error("Please write a longer message");
    addInquiry({ buyer_id: userId, property_id: property!.id, message: msg.trim() });
    setMsg(""); setOpen(false);
    toast.success("Inquiry sent");
  }

  return (
    <div className="space-y-8">
      <Link to="/buyer/properties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3 overflow-hidden rounded-2xl">
          <img src={property.images[active]} alt={property.title} className="aspect-[16/10] w-full object-cover" />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
          {property.images.map((u, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={cn("aspect-square overflow-hidden rounded-xl border-2 transition", active === i ? "border-accent" : "border-transparent hover:border-border")}>
              <img src={u} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{property.type}</Badge>
              <Badge>{property.status}</Badge>
              {property.featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-5xl">{property.title}</h1>
            <div className="mt-2 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {property.location}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2"><BedDouble className="h-5 w-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Beds</div><div className="font-medium">{property.bedrooms}</div></div></div>
            <div className="flex items-center gap-2"><Bath className="h-5 w-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Baths</div><div className="font-medium">{property.bathrooms}</div></div></div>
            <div className="flex items-center gap-2"><Ruler className="h-5 w-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Area</div><div className="font-medium">{property.area_size.toLocaleString()} sqft</div></div></div>
          </div>

          <div>
            <h2 className="font-display text-2xl">About this property</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{property.description}</p>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24 lg:self-start">
          <div className="text-sm text-muted-foreground">Asking price</div>
          <div className="font-display text-4xl">{formatPrice(property.price)}</div>
          <div className="mt-5 flex flex-col gap-2">
            <Button className="w-full bg-accent text-accent-foreground hover:opacity-90" onClick={() => setOpen(true)}>
              <Send className="mr-1 h-4 w-4" /> Send inquiry
            </Button>
            <Button variant="outline" className="w-full" onClick={() => userId && toggle(userId, property.id)}>
              <Heart className={cn("mr-1 h-4 w-4", isFav && "fill-accent text-accent")} />
              {isFav ? "Saved to favorites" : "Add to favorites"}
            </Button>
          </div>
        </aside>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send an inquiry</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">About <span className="font-medium text-foreground">{property.title}</span></p>
          <Textarea rows={5} placeholder="Hi, I'd love to schedule a tour…" value={msg} onChange={(e) => setMsg(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={sendInquiry}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
