import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/auth/register")({
  ssr: false,
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const register = useApp((s) => s.register);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "", role: "buyer" as Role });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 1 || form.password.length > 6) return toast.error("Password must be 1 to 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    setBusy(true);
    try {
      const res = await register({ full_name: form.full_name.trim(), email: form.email.trim(), password: form.password, role: form.role });
      if (!res.ok) return toast.error(res.error ?? "Registration failed");
      toast.success("Account created");
      navigate({ to: form.role === "agent" ? "/agent" : "/buyer", replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div className="flex items-center gap-2 font-display text-xl"><Building2 className="h-5 w-5 text-accent" /> Estata</div>
          <div>
            <h1 className="font-display text-3xl">Create account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Join as an agent or a buyer.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm</Label>
                <Input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>I am a…</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["buyer","agent"] as Role[]).map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                    className={`rounded-xl border px-4 py-3 text-left transition ${form.role===r?"border-accent bg-accent/10":"border-border hover:bg-muted/60"}`}>
                    <div className="font-medium capitalize">{r}</div>
                    <div className="text-xs text-muted-foreground">{r === "agent" ? "List & manage properties" : "Browse & inquire"}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Creating…" : "Create account"}</Button>
          <p className="text-center text-sm text-muted-foreground">
            Have an account? <Link to="/auth/login" className="font-medium text-accent hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
      <div className="relative hidden lg:block">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=70" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/80 via-primary/40 to-transparent" />
      </div>
    </div>
  );
}
