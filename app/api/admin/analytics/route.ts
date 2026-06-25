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
  const range = new URL(request.url).searchParams.get("range") || "week";
  const { since, unit, fmt, buckets } = plan(range);
  const { Event } = await getModels();
  const inRange = { createdAt: { $gte: since } };

  const [traffic, uniq, searches, topSearch, topProd, topShop, totals] = await Promise.all([
    Event.aggregate([
      { $match: { ...inRange, type: "pageview" } },
      { $group: { _id: { $dateToString: { format: fmt, date: "$createdAt", timezone: TZ } }, count: { $sum: 1 } } },
    ]),
    Event.distinct("visitorId", { ...inRange, type: "pageview" }),
    Event.countDocuments({ ...inRange, type: "search" }),
    Event.aggregate([
      { $match: { ...inRange, type: "search", query: { $nin: [null, ""] } } },
      { $group: { _id: "$query", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 12 },
    ]),
    Event.aggregate([
      { $match: { ...inRange, type: "view_product" } },
      { $group: { _id: { slug: "$slug", name: "$name" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 },
    ]),
    Event.aggregate([
      { $match: { ...inRange, type: "view_shop" } },
      { $group: { _id: { slug: "$slug", name: "$name" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 },
    ]),
    Event.aggregate([{ $match: inRange }, { $group: { _id: "$type", count: { $sum: 1 } } }]),
  ]);

  const trafficMap = new Map<string, number>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  traffic.forEach((t: any) => trafficMap.set(t._id, t.count));
  const series = buckets.map((d) => ({ key: keyOf(d, unit), label: labelOf(d, unit), views: trafficMap.get(keyOf(d, unit)) ?? 0 }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalsMap: Record<string, number> = {}; totals.forEach((t: any) => (totalsMap[t._id] = t.count));

  return NextResponse.json({
    range,
    series,
    uniqueVisitors: uniq.filter(Boolean).length,
    totals: {
      pageviews: totalsMap.pageview ?? 0,
      searches: totalsMap.search ?? 0,
      productViews: totalsMap.view_product ?? 0,
      shopViews: totalsMap.view_shop ?? 0,
    },
    searchesCount: searches,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topSearches: topSearch.map((s: any) => ({ query: s._id, count: s.count })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topProducts: topProd.map((s: any) => ({ slug: s._id.slug, name: s._id.name || s._id.slug, count: s.count })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topShops: topShop.map((s: any) => ({ slug: s._id.slug, name: s._id.name || s._id.slug, count: s.count })),
  });
}
