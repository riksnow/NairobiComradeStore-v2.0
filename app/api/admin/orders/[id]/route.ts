import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";
import { canTransition, type OrderStatus } from "@/lib/constants";
import { sendOrderEmailForStatus, emailKindForStatus } from "@/lib/order-emails";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { Order } = await getModels();
  const order = await Order.findById(id).populate("user", "name email").lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(order));
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const next = b.status as OrderStatus;
  const { Order, Notification, User } = await getModels();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark payment received (e.g. confirmed Cash on Delivery / manual M-Pesa).
  if (typeof b.isPaid === "boolean" && b.isPaid !== order.isPaid) {
    order.isPaid = b.isPaid;
    if (b.isPaid) order.paidAt = new Date();
    await order.save();
  }

  if (next && next !== order.status) {
    if (!canTransition(order.status as OrderStatus, next)) {
      return NextResponse.json({ error: `Cannot move from ${order.status} to ${next}.` }, { status: 400 });
    }
    // Payment gate: an order can't be marked Delivered until it's paid.
    if (next === "Delivered" && !order.isPaid) {
      return NextResponse.json({ error: "Payment must be received before an order can be marked Delivered." }, { status: 400 });
    }
    order.status = next;
    order.statusHistory.push({ status: next, timestamp: new Date(), note: b.note });
    if (next === "Delivered") order.deliveredAt = new Date();
    if (next === "Cancelled") { order.cancelledAt = new Date(); order.cancellationReason = b.note; }
    await order.save();

    // notify customer + send dedup email
    await Notification.create({
      user: order.user, type: "order",
      title: `Order ${next}`,
      message: `Your order is now ${next}.`,
      link: `/account/orders/${order._id}`,
    });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customer: any = await User.findById(order.user).select("name email").lean();
      const kind = await sendOrderEmailForStatus(
        { _id: order._id, total: order.total, status: next, emailsSent: order.emailsSent },
        customer?.email ?? "", customer?.name ?? "comrade"
      );
      const k = kind ?? emailKindForStatus(next);
      if (kind && k) { order.emailsSent[k] = true; await order.save(); }
    } catch { /* ignore */ }
  }
  return NextResponse.json(serialize(order.toObject()));
}
