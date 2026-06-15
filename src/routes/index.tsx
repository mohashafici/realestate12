import { createFileRoute, redirect } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  if (typeof window === "undefined") return null;
  const userId = useApp((s) => s.currentUserId);
  const user = useApp((s) => s.users.find((u) => u.id === userId));
  if (!user) throw redirect({ to: "/auth/login" });
  throw redirect({ to: user.role === "agent" ? "/agent" : "/buyer" });
}
