import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/buyer/inquiries")({
  component: MyInquiries,
});

function MyInquiries() {
  const userId = useApp((s) => s.currentUserId);
  const inquiries = useApp((s) => s.inquiries.filter((i) => i.buyer_id === userId));
  const properties = useApp((s) => s.properties);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">My inquiries</h1>
        <p className="text-sm text-muted-foreground">{inquiries.length} messages sent</p>
      </header>
      {inquiries.length === 0 ? (
        <EmptyState title="You haven't sent any inquiries yet" description="Browse properties and send a message to an agent." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((i) => {
                const p = properties.find((x) => x.id === i.property_id);
                return (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{p?.title ?? "(removed)"}</TableCell>
                    <TableCell className="max-w-md"><p className="line-clamp-2 text-sm text-muted-foreground">{i.message}</p></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(i.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell><Badge variant={i.status === "Pending" ? "default" : i.status === "Read" ? "secondary" : "outline"}>{i.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
