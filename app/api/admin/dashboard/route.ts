import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Product, Order, User, Review } = await getModels();

  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [products, orders, customers, reviews, paidAgg, statusAgg, recent, dailyAgg] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: "Customer" }),
    Review.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: "Cancelled" } } }, { $group: { _id: null, revenue: { $sum: "$total" } } }]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(8).select("total status paymentMethod createdAt").lean(),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byStatus: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusAgg.forEach((s: any) => (byStatus[s._id] = s.count));

  // Build a continuous 14-day series (fill gaps with zero).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dailyAgg.forEach((d: any) => dailyMap.set(d._id, { revenue: d.revenue, orders: d.orders }));
  const sales: { date: string; label: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const hit = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
    sales.push({ date: key, label: d.toLocaleDateString("en-KE", { day: "numeric", month: "short" }), revenue: hit.revenue, orders: hit.orders });
  }

  return NextResponse.json({
    products, orders, customers, reviews,
    revenue: paidAgg[0]?.revenue ?? 0,
    byStatus,
    sales,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recent: recent.map((o: any) => ({ id: String(o._id), total: o.total, status: o.status, paymentMethod: o.paymentMethod, createdAt: o.createdAt })),
  });
}
