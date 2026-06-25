import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";

export const dynamic = "force-dynamic";

const TZ = "Africa/Nairobi";
type Unit = "hour" | "day" | "month";

function partsOf(d: Date) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" });
  const o: Record<string, string> = {};
  for (const p of f.formatToParts(d)) o[p.type] = p.value;
  return o;
}
function keyOf(d: Date, unit: Unit) {
  const p = partsOf(d);
  if (unit === "hour") return `${p.year}-${p.month}-${p.day} ${p.hour}`;
  if (unit === "month") return `${p.year}-${p.month}`;
  return `${p.year}-${p.month}-${p.day}`;
}
function labelOf(d: Date, unit: Unit) {
  if (unit === "hour") return `${partsOf(d).hour}:00`;
  if (unit === "month") return new Intl.DateTimeFormat("en-KE", { timeZone: TZ, month: "short" }).format(d);
  return new Intl.DateTimeFormat("en-KE", { timeZone: TZ, day: "numeric", month: "short" }).format(d);
}
function plan(range: string): { since: Date; unit: Unit; fmt: string; buckets: Date[] } {
  const now = new Date();
  const buckets: Date[] = [];
  if (range === "day") {
    const since = new Date(now.getTime() - 23 * 3600e3);
    for (let i = 0; i < 24; i++) buckets.push(new Date(since.getTime() + i * 3600e3));
    return { since, unit: "hour", fmt: "%Y-%m-%d %H", buckets };
  }
  if (range === "year") {
    const since = new Date(now); since.setMonth(since.getMonth() - 11);
    for (let i = 0; i < 12; i++) { const d = new Date(since); d.setMonth(since.getMonth() + i); buckets.push(d); }
    return { since, unit: "month", fmt: "%Y-%m", buckets };
  }
  const days = range === "week" ? 7 : 30;
  const since = new Date(now.getTime() - (days - 1) * 86400e3);
  for (let i = 0; i < days; i++) buckets.push(new Date(since.getTime() + i * 86400e3));
  return { since, unit: "day", fmt: "%Y-%m-%d", buckets };
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const range = new URL(request.url).searchParams.get("range") || "month";
  const { Product, Order, User, Review } = await getModels();
  const { since, unit, fmt, buckets } = plan(range);

  // Start of today in Nairobi (UTC+3, no DST).
  const nbDate = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const todayStart = new Date(`${nbDate}T00:00:00+03:00`);

  const [products, orders, customers, reviews, paidAgg, statusAgg, recent, seriesAgg, todayOrders] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: "Customer" }),
    Review.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: "Cancelled" } } }, { $group: { _id: null, revenue: { $sum: "$total" } } }]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(8).select("total status paymentMethod createdAt").lean(),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: fmt, date: "$createdAt", timezone: TZ } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    Order.find({ createdAt: { $gte: todayStart } }).sort({ createdAt: -1 }).select("total status paymentMethod isPaid createdAt items").lean(),
  ]);

  const byStatus: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusAgg.forEach((s: any) => (byStatus[s._id] = s.count));

  const map = new Map<string, { revenue: number; orders: number }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seriesAgg.forEach((d: any) => map.set(d._id, { revenue: d.revenue, orders: d.orders }));
  const sales = buckets.map((d) => {
    const hit = map.get(keyOf(d, unit)) ?? { revenue: 0, orders: 0 };
    return { date: keyOf(d, unit), label: labelOf(d, unit), revenue: hit.revenue, orders: hit.orders };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const today = (todayOrders as any[]).map((o) => ({
    id: String(o._id), total: o.total, status: o.status, paymentMethod: o.paymentMethod, isPaid: o.isPaid,
    items: Array.isArray(o.items) ? o.items.reduce((n: number, it: { qty?: number }) => n + (it.qty ?? 1), 0) : 0,
    createdAt: o.createdAt,
  }));
  const todayRevenue = today.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

  return NextResponse.json({
    products, orders, customers, reviews,
    revenue: paidAgg[0]?.revenue ?? 0,
    byStatus, sales, range,
    today, todayRevenue,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recent: recent.map((o: any) => ({ id: String(o._id), total: o.total, status: o.status, paymentMethod: o.paymentMethod, createdAt: o.createdAt })),
  });
}
