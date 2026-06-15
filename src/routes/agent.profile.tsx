import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/agent/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useApp((s) => s.users.find((u) => u.id === s.currentUserId));
  const update = useApp((s) => s.updateProfile);
  const [form, setForm] = useState({ full_name: user?.full_name ?? "", email: user?.email ?? "" });

  function save(e: React.FormEvent) {
    e.preventDefault();
    update(form);
    toast.success("Profile updated");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header><h1 className="font-display text-3xl md:text-4xl">Profile</h1></header>
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-accent text-2xl text-accent-foreground">{user?.full_name?.[0]}</div>
        <div>
          <div className="font-display text-xl">{user?.full_name}</div>
          <div className="text-sm capitalize text-muted-foreground">{user?.role}</div>
        </div>
      </div>
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="space-y-1.5"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="flex justify-end"><Button type="submit">Save changes</Button></div>
      </form>
    </div>
  );
}
