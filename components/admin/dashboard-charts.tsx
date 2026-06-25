"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatKsh } from "@/lib/utils";

type Sales = { date: string; label: string; revenue: number; orders: number };

const STATUS_ORDER = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
const STATUS_COLORS: Record<string, string> = {
  Pending: "#e3a890",
  Processing: "#d98a6e",
  Shipped: "#c96442",
  Delivered: "#9c4a2c",
  Cancelled: "#b8b2a4",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-primary">{formatKsh(payload[0].value)}</p>
      <p className="text-muted-foreground">{payload[0].payload.orders} order{payload[0].payload.orders === 1 ? "" : "s"}</p>
    </div>
  );
}

export function DashboardCharts({ sales, byStatus, salesTitle = "Sales" }: { sales: Sales[]; byStatus: Record<string, number>; salesTitle?: string }) {
  const pieData = STATUS_ORDER.map((s) => ({ name: s, value: byStatus[s] ?? 0 })).filter((d) => d.value > 0);
  const totalOrders = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg text-foreground">{salesTitle}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Daily revenue across non-cancelled orders.</p>
        <div className="mt-5 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c96442" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#c96442" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={56}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#c96442" strokeWidth={2.5} fill="url(#revFill)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg text-foreground">Orders by status</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{totalOrders} orders total.</p>
        <div className="mt-2 h-[260px] w-full">
          {pieData.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No orders yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={2} stroke="var(--card)" strokeWidth={2}>
                  {pieData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] ?? "#c96442"} />)}
                </Pie>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip formatter={(v: any, n: any) => [`${v} orders`, n]} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
