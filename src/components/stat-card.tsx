import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon, tone = "default" }: { label: string; value: ReactNode; icon?: ReactNode; tone?: "default" | "accent" | "success" | "warning" | "destructive" }) {
  const tones = {
    default: "bg-card",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-3xl">{value}</div>
        </div>
        {icon && <div className={cn("grid h-10 w-10 place-items-center rounded-xl", tones[tone])}>{icon}</div>}
      </div>
    </div>
  );
}
