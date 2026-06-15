import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Edit3, Eye, Plus, Star, Trash2 } from "lucide-react";
import { useApp, formatPrice } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Property } from "@/lib/types";

export const Route = createFileRoute("/agent/properties/")({
  component: PropertiesPage,
});

function PropertiesPage() {
  const properties = useApp((s) => s.properties);
  const toggleFeatured = useApp((s) => s.toggleFeatured);
  const deleteProperty = useApp((s) => s.deleteProperty);
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [view, setView] = useState<Property | null>(null);

  const filtered = properties.filter((p) =>
    !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.location.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Properties</h1>
          <p className="text-sm text-muted-foreground">{properties.length} total listings</p>
        </div>
        <Link to="/agent/properties/new"><Button><Plus className="mr-1 h-4 w-4" /> Add property</Button></Link>
      </header>

      <Input placeholder="Search by title or location…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell><img src={p.images[0]} alt="" className="h-12 w-16 rounded-md object-cover" /></TableCell>
                <TableCell className="font-medium">{p.title}<div className="text-xs text-muted-foreground">{p.type}</div></TableCell>
                <TableCell>{p.location}</TableCell>
                <TableCell>{formatPrice(p.price)}</TableCell>
                <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
                <TableCell className="text-center">
                  <button onClick={() => { toggleFeatured(p.id); toast.success(p.featured ? "Removed from featured" : "Marked as featured"); }}
                    aria-label="Toggle featured" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                    <Star className={`h-4 w-4 ${p.featured ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setView(p)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                    <Link to="/agent/properties/$id/edit" params={{ id: p.id }}>
                      <Button size="icon" variant="ghost" aria-label="Edit"><Edit3 className="h-4 w-4" /></Button>
                    </Link>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmId(p.id)} aria-label="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No properties match your search.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>This will also remove related inquiries and favorites. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmId) { deleteProperty(confirmId); toast.success("Property deleted"); } setConfirmId(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl">
          {view && (
            <>
              <DialogHeader><DialogTitle className="font-display text-2xl">{view.title}</DialogTitle></DialogHeader>
              <img src={view.images[0]} alt="" className="aspect-video w-full rounded-xl object-cover" />
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><div className="text-muted-foreground">Type</div><div className="font-medium">{view.type}</div></div>
                <div><div className="text-muted-foreground">Price</div><div className="font-medium">{formatPrice(view.price)}</div></div>
                <div><div className="text-muted-foreground">Status</div><div className="font-medium">{view.status}</div></div>
                <div><div className="text-muted-foreground">Area</div><div className="font-medium">{view.area_size.toLocaleString()} sqft</div></div>
              </div>
              <p className="text-sm text-muted-foreground">{view.description}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
