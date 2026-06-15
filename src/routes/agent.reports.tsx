import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { Building2, Home, BedDouble, Star, Inbox, BadgeDollarSign } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useApp, formatPrice } from "@/lib/store";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/agent/reports")({
  component: ReportsPage,
});

const COLORS = ["oklch(0.62 0.14 155)", "oklch(0.78 0.15 80)", "oklch(0.58 0.22 27)", "oklch(0.66 0.14 40)"];

function ReportsPage() {
  const properties = useApp((s) => s.properties);
  const inquiries = useApp((s) => s.inquiries);

  const counts = {
    total: properties.length,
    available: properties.filter((p) => p.status === "Available").length,
    rented: properties.filter((p) => p.status === "Rented").length,
    sold: properties.filter((p) => p.status === "Sold").length,
    featured: properties.filter((p) => p.featured).length,
    inquiries: inquiries.length,
  };

  const statusData = [
    { name: "Available", value: counts.available },
    { name: "Rented", value: counts.rented },
    { name: "Sold", value: counts.sold },
    { name: "Featured", value: counts.featured },
  ];

  const monthly = useMemo(() => {
    const m = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      m.set(format(d, "MMM"), 0);
    }
    inquiries.forEach((i) => {
      const key = format(new Date(i.created_at), "MMM");
      if (m.has(key)) m.set(key, (m.get(key) ?? 0) + 1);
    });
    return Array.from(m.entries()).map(([month, count]) => ({ month, count }));
  }, [inquiries]);

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Estata — Property Report", 14, 18);
    doc.setFontSize(10); doc.text(format(new Date(), "PPP"), 14, 25);
    autoTable(doc, {
      startY: 32,
      head: [["Metric", "Value"]],
      body: [
        ["Total Properties", counts.total],
        ["Available", counts.available],
        ["Rented", counts.rented],
        ["Sold", counts.sold],
        ["Featured", counts.featured],
        ["Total Inquiries", counts.inquiries],
      ],
    });
    autoTable(doc, {
      head: [["Title", "Type", "Location", "Price", "Status"]],
      body: properties.map((p) => [p.title, p.type, p.location, formatPrice(p.price), p.status]),
    });
    doc.save("estata-report.pdf");
    toast.success("PDF exported");
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { Metric: "Total Properties", Value: counts.total },
      { Metric: "Available", Value: counts.available },
      { Metric: "Rented", Value: counts.rented },
      { Metric: "Sold", Value: counts.sold },
      { Metric: "Featured", Value: counts.featured },
      { Metric: "Total Inquiries", Value: counts.inquiries },
    ]), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(properties.map((p) => ({
      Title: p.title, Type: p.type, Location: p.location, Price: p.price, Status: p.status, Featured: p.featured,
    }))), "Properties");
    XLSX.writeFile(wb, "estata-report.xlsx");
    toast.success("Excel exported");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Reports</h1>
          <p className="text-sm text-muted-foreground">Portfolio performance at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}><FileText className="mr-1 h-4 w-4" /> Export PDF</Button>
          <Button onClick={exportExcel}><Download className="mr-1 h-4 w-4" /> Export Excel</Button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Properties" value={counts.total} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Available" value={counts.available} icon={<Home className="h-5 w-5" />} tone="success" />
        <StatCard label="Rented" value={counts.rented} icon={<BedDouble className="h-5 w-5" />} tone="warning" />
        <StatCard label="Sold" value={counts.sold} icon={<BadgeDollarSign className="h-5 w-5" />} tone="destructive" />
        <StatCard label="Featured" value={counts.featured} icon={<Star className="h-5 w-5" />} tone="accent" />
        <StatCard label="Inquiries" value={counts.inquiries} icon={<Inbox className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-display text-xl">Property status breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={100} paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-display text-xl">Monthly inquiries</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 80)" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="oklch(0.66 0.14 40)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
