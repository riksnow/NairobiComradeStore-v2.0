"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Package, ShoppingBag, Users, Star, CalendarDays } from "lucide-react";
import { formatKsh, formatDateTime, cn } from "@/lib/utils";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

type TodayOrder = { id: string; total: number; status: string; paymentMethod: string; isPaid: boolean; items: number; createdAt: string };
type Dash = {
  products: number; orders: number; customers: number; reviews: number; revenue: number;
  byStatus: Record<string, number>;
  sales: { date: string; label: string; revenue: number; orders: number }[];
  recent: { id: string; total: number; status: string; paymentMethod: string; createdAt: string }[];
  today: TodayOrder[]; todayRevenue: number;
};

const RANGES = [{ id: "day", label: "Day" }, { id: "week", label: "Week" }, { id: "month", label: "Month" }, { id: "year", label: "Year" }];
const RANGE_TITLE: Record<string, string> = { day: "Revenue — last 24 hours", week: "Revenue — last 7 days", month: "Revenue — last 30 days", year: "Revenue — last 12 months" };

function StatusPill({ s }: { s: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-xs", s === "Delivered" ? "bg-primary/10 text-primary" : s === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground/70")}>{s}</span>;
}

export default function AdminOverviewPage() {
  const [d, setD] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/admin/dashboard?range=${range}`).then((r) => (r.ok ? r.json() : null)).then((j) => { if (active) { setD(j); setLoading(false); } }).catch(() => active && setLoading(false));
    return () => { active = false; };
  }, [range]);

  if (loading && !d) return <p className="text-sm text-muted-foreground">Loading…</p>;
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live store performance from the database.</p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {RANGES.map((r) => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={cn("rounded-md px-3 py-1.5 text-sm transition-colors", range === r.id ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground")}>
              {r.label}
            </button>
          ))}
        </div>
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

      <DashboardCharts sales={d.sales ?? []} byStatus={d.byStatus} salesTitle={RANGE_TITLE[range]} />

      {/* Today's orders */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-serif text-lg text-foreground"><CalendarDays className="size-4 text-primary" /> Today&apos;s orders</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{d.today.length} order{d.today.length === 1 ? "" : "s"}</span>
            <span className="font-medium text-foreground">{formatKsh(d.todayRevenue)}</span>
          </div>
        </div>
        {d.today.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">No orders yet today.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Order</th><th className="py-2 pr-4 font-medium">Time</th>
                <th className="py-2 pr-4 font-medium">Items</th><th className="py-2 pr-4 font-medium">Payment</th>
                <th className="py-2 pr-4 font-medium">Paid</th><th className="py-2 pr-4 font-medium">Status</th><th className="py-2 font-medium">Total</th>
              </tr></thead>
              <tbody>
                {d.today.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 font-medium"><Link href={`/admin/orders/${o.id}`} className="text-foreground hover:text-primary hover:underline">#{o.id.slice(-6).toUpperCase()}</Link></td>
                    <td className="py-2 pr-4 text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{o.items}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{o.paymentMethod}</td>
                    <td className="py-2 pr-4"><span className={o.isPaid ? "text-primary" : "text-muted-foreground"}>{o.isPaid ? "Yes" : "No"}</span></td>
                    <td className="py-2 pr-4"><StatusPill s={o.status} /></td>
                    <td className="py-2 font-medium text-foreground">{formatKsh(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
                  <td className="py-2 pr-4 font-medium"><Link href={`/admin/orders/${o.id}`} className="text-foreground hover:text-primary hover:underline">#{o.id.slice(-6).toUpperCase()}</Link></td>
                  <td className="py-2 pr-4 text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{o.paymentMethod}</td>
                  <td className="py-2 pr-4"><StatusPill s={o.status} /></td>
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
