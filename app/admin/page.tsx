"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Package, ShoppingBag, Users, Star } from "lucide-react";
import { formatKsh, formatDate, cn } from "@/lib/utils";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

type Dash = {
  products: number; orders: number; customers: number; reviews: number; revenue: number;
  byStatus: Record<string, number>;
  sales: { date: string; label: string; revenue: number; orders: number }[];
  recent: { id: string; total: number; status: string; paymentMethod: string; createdAt: string }[];
};

export default function AdminOverviewPage() {
  const [d, setD] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) setD(await res.json());
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!d) return <p className="text-sm text-muted-foreground">Could not load dashboard. Make sure the database is configured.</p>;

  const stats = [
    { label: "Revenue", value: formatKsh(d.revenue), icon: TrendingUp, hint: `${d.orders} orders` },
    { label: "Orders", value: String(d.orders), icon: ShoppingBag, hint: "all time" },
    { label: "Products", value: String(d.products), icon: Package, hint: "in catalog" },
    { label: "Customers", value: String(d.customers), icon: Users, hint: "registered" },
    { label: "Reviews", value: String(d.reviews), icon: Star, hint: "submitted" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live store performance from the database.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[0.55rem] text-muted-foreground">{s.label}</span>
                <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-3.5" /></span>
              </div>
              <p className="mt-2 text-lg font-medium leading-tight text-foreground">{s.value}</p>
              <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{s.hint}</p>
            </div>
          );
        })}
      </div>

      <DashboardCharts sales={d.sales ?? []} byStatus={d.byStatus} />

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg text-foreground">Recent orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Order</th><th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Payment</th><th className="py-2 pr-4 font-medium">Status</th><th className="py-2 font-medium">Total</th>
            </tr></thead>
            <tbody>
              {d.recent.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 font-medium text-foreground">#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{o.paymentMethod}</td>
                  <td className="py-2 pr-4"><span className={cn("rounded-full px-2 py-0.5 text-xs", o.status === "Delivered" ? "bg-primary/10 text-primary" : o.status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground/70")}>{o.status}</span></td>
                  <td className="py-2 font-medium text-foreground">{formatKsh(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
