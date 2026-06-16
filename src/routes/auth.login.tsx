import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/login")({
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useApp((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await login(email.trim(), password);
      if (!res.ok) { toast.error(res.error ?? "Login failed"); return; }
      toast.success("Welcome back");
      navigate({ to: res.role === "agent" ? "/agent" : "/buyer", replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=70" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-primary/40 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-primary-foreground">
          <div className="flex items-center gap-2 font-display text-2xl"><Building2 className="h-6 w-6 text-accent" /> Estata</div>
          <div>
            <h2 className="font-display text-4xl leading-tight">Find homes. Manage listings. All in one calm place.</h2>
            <p className="mt-3 max-w-md text-sm text-primary-foreground/80">A modern workspace for agents and a quiet gallery for buyers.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-display text-3xl">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with your email and password.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Sign in"}</Button>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/auth/register" className="font-medium text-accent hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
