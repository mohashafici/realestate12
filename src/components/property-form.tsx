import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Star, X, Plus } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Property, PropertyStatus, PropertyType } from "@/lib/types";

interface FormState {
  title: string;
  description: string;
  type: PropertyType;
  price: number | "";
  location: string;
  bedrooms: number | "";
  bathrooms: number | "";
  area_size: number | "";
  images: string[];
  status: PropertyStatus;
  featured: boolean;
}

const defaultState: FormState = {
  title: "", description: "", type: "House", price: "", location: "",
  bedrooms: "", bathrooms: "", area_size: "",
  images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=70"],
  status: "Available", featured: false,
};

export function PropertyForm({ initial, onSubmit, submitLabel }: {
  initial?: Partial<Property>;
  onSubmit: (data: Omit<Property, "id" | "created_at" | "created_by">) => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormState>({
    ...defaultState,
    ...(initial ? {
      title: initial.title ?? "",
      description: initial.description ?? "",
      type: initial.type ?? "House",
      price: initial.price ?? "",
      location: initial.location ?? "",
      bedrooms: initial.bedrooms ?? "",
      bathrooms: initial.bathrooms ?? "",
      area_size: initial.area_size ?? "",
      images: initial.images ?? defaultState.images,
      status: initial.status ?? "Available",
      featured: initial.featured ?? false,
    } : {}),
  });
  const [newImage, setNewImage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) return toast.error("Title and location required");
    if (form.price === "" || +form.price <= 0) return toast.error("Enter a valid price");
    if (form.images.length === 0) return toast.error("Add at least one image");
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      price: +form.price,
      location: form.location.trim(),
      bedrooms: +(form.bedrooms || 0),
      bathrooms: +(form.bathrooms || 0),
      area_size: +(form.area_size || 0),
      images: form.images,
      status: form.status,
      featured: form.featured,
    });
  }

  function addImage() {
    const url = newImage.trim();
    if (!url) return;
    setForm({ ...form, images: [...form.images, url] });
    setNewImage("");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label>Property title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Modern Coastal Villa" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as PropertyType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["House","Apartment","Villa","Land","Office"] as PropertyType[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PropertyStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["Available","Rented","Sold"] as PropertyStatus[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Price (USD)</Label>
          <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value === "" ? "" : +e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Malibu, CA" />
        </div>
        <div className="space-y-1.5">
          <Label>Bedrooms</Label>
          <Input type="number" min={0} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value === "" ? "" : +e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Bathrooms</Label>
          <Input type="number" min={0} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value === "" ? "" : +e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Area size (sqft)</Label>
          <Input type="number" min={0} value={form.area_size} onChange={(e) => setForm({ ...form, area_size: e.target.value === "" ? "" : +e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Property images</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {form.images.map((url, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-background/90 opacity-0 transition group-hover:opacity-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Paste image URL…" value={newImage} onChange={(e) => setNewImage(e.target.value)} />
          <Button type="button" variant="outline" onClick={addImage}><Plus className="mr-1 h-4 w-4" /> Add</Button>
        </div>
        <p className="text-xs text-muted-foreground">Images by URL (Unsplash works great). Real uploads come with the backend.</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <div className="font-medium">Featured property</div>
          <div className="text-xs text-muted-foreground">Highlight on the buyer home page.</div>
        </div>
        <button type="button" onClick={() => setForm({ ...form, featured: !form.featured })}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${form.featured ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-muted"}`}>
          <Star className={`h-4 w-4 ${form.featured ? "fill-accent" : ""}`} /> {form.featured ? "Featured" : "Mark as featured"}
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <Link to="/agent/properties"><Button type="button" variant="ghost">Cancel</Button></Link>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

export function NewOrEditWrapper({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header><h1 className="font-display text-3xl md:text-4xl">{title}</h1></header>
      {children}
    </div>
  );
}

export function useAddProperty() {
  const navigate = useNavigate();
  const add = useApp((s) => s.addProperty);
  const user = useApp((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
  return (data: Omit<Property, "id" | "created_at" | "created_by">) => {
    if (!user) return;
    add(data, user.id);
    toast.success("Property saved");
    navigate({ to: "/agent/properties" });
  };
}
