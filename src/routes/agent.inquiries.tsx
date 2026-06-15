import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, MailOpen, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { InquiryStatus } from "@/lib/types";

export const Route = createFileRoute("/agent/inquiries")({
  component: InquiriesPage,
});

function InquiriesPage() {
  const inquiries = useApp((s) => s.inquiries);
  const properties = useApp((s) => s.properties);
  const users = useApp((s) => s.users);
  const setStatus = useApp((s) => s.setInquiryStatus);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");

  const list = inquiries.filter((i) => {
    if (filter !== "all" && i.status !== filter) return false;
    if (!q) return true;
    const buyer = users.find((u) => u.id === i.buyer_id)?.full_name ?? "";
    const prop = properties.find((p) => p.id === i.property_id)?.title ?? "";
    return (buyer + prop + i.message).toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Inquiries</h1>
        <p className="text-sm text-muted-foreground">Manage buyer messages.</p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search inquiries…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Read">Read</SelectItem>
            <SelectItem value="Responded">Responded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No inquiries found" />
      ) : (
        <div className="space-y-3">
          {list.map((i) => {
            const buyer = users.find((u) => u.id === i.buyer_id);
            const prop = properties.find((p) => p.id === i.property_id);
            return (
              <article key={i.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{buyer?.full_name ?? "Unknown"}</h3>
                      <span className="text-xs text-muted-foreground">{buyer?.email}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{prop?.title} · {format(new Date(i.created_at), "MMM d, yyyy")}</div>
                    <p className="mt-3 text-sm">{i.message}</p>
                  </div>
                  <Badge variant={i.status === "Pending" ? "default" : i.status === "Read" ? "secondary" : "outline"}>{i.status}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setStatus(i.id, "Read"); toast.success("Marked as read"); }} disabled={i.status !== "Pending"}>
                    <MailOpen className="mr-1 h-4 w-4" /> Mark as read
                  </Button>
                  <Button size="sm" onClick={() => { setStatus(i.id, "Responded"); toast.success("Marked as responded"); }} disabled={i.status === "Responded"}>
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Mark as responded
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
