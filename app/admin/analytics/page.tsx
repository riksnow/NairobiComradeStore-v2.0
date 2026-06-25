"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Users, Search as SearchIcon, Package, Store, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

type Analytics = {
  range: string;
  series: { key: string; label: string; views: number }[];
  uniqueVisitors: number;
  totals: { pageviews: number; searches: number; productViews: number; shopViews: number };
  topSearches: { query: string; count: number }[];
  topProducts: { slug: string; name: string; count: number }[];
  topShops: { slug: string; name: string; count: number }[];
};

const RANGES = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("week");
  const [d, setD] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`).then((r) => (r.ok ? r.json() : null)).then((j) => { if (active) { setD(j); setLoading(false); } }).catch(() => active && setLoading(false));
    return () => { active = false; };
  }, [range]);

  const stats = d ? [
    { label: "Unique visitors", value: d.uniqueVisitors, icon: Users },
    { label: "Page views", value: d.totals.pageviews, icon: Eye },
    { label: "Searches", value: d.totals.searches, icon: SearchIcon },
    { label: "Product views", value: d.totals.productViews, icon: Package },
    { label: "Shop views", value: d.totals.shopViews, icon: Store },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground md:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visitor behaviour, searches and the most-visited products & shops.</p>
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

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && !d && <p className="text-sm text-muted-foreground">Could not load analytics. Make sure the database is configured.</p>}

      {!loading && d && (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-[0.55rem] text-muted-foreground">{s.label}</span>
                    <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-3.5" /></span>
                  </div>
                  <p className="mt-2 text-lg font-medium leading-tight text-foreground">{s.value.toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg text-foreground"><TrendingUp className="size-4 text-primary" /> Traffic</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Page views over the selected period.</p>
            <div className="mt-5 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.series} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c96442" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#c96442" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [`${v} views`, ""]} labelStyle={{ color: "var(--foreground)" }} />
                  <Area type="monotone" dataKey="views" stroke="#c96442" strokeWidth={2.5} fill="url(#trafficFill)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <BarCard title="Top searches" icon={<SearchIcon className="size-4 text-primary" />} empty="No searches yet."
              rows={d.topSearches.map((s) => ({ label: s.query, count: s.count }))} />
            <BarCard title="Most-visited products" icon={<Package className="size-4 text-primary" />} empty="No product views yet."
              rows={d.topProducts.map((p) => ({ label: p.name, count: p.count, href: `/product/${p.slug}` }))} />
            <BarCard title="Most-visited shops" icon={<Store className="size-4 text-primary" />} empty="No shop views yet."
              rows={d.topShops.map((p) => ({ label: p.name, count: p.count, href: `/shop/${p.slug}` }))} />
          </div>
        </>
      )}
    </div>
  );
}

function BarCard({ title, icon, rows, empty }: { title: string; icon: React.ReactNode; rows: { label: string; count: number; href?: string }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 font-serif text-base text-foreground">{icon} {title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {rows.map((r, i) => (
            <li key={i}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {r.href ? <Link href={r.href} className="hover:text-primary hover:underline">{r.label}</Link> : r.label}
                </span>
                <span className="shrink-0 text-muted-foreground">{r.count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
