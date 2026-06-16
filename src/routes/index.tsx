import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const ready = useApp((s) => s.ready);
  const userId = useApp((s) => s.currentUserId);
  const user = useApp((s) => s.users.find((u) => u.id === userId) ?? null);
  useEffect(() => {
    if (!ready) return;
    if (!userId) navigate({ to: "/auth/login", replace: true });
    else if (user) navigate({ to: user.role === "agent" ? "/agent" : "/buyer", replace: true });
  }, [ready, userId, user, navigate]);
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="text-muted-foreground">Loading…</div>
    </div>
  );
}
