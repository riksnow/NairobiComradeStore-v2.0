import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { initiateStkPush } from "@/lib/mpesa";

export const dynamic = "force-dynamic";

// Admin prompts the customer's phone with an M-Pesa STK push. The Daraja webhook
// (app/api/webhooks/mpesa) confirms and marks the order paid when the customer approves.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { Order, Notification } = await getModels();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.isPaid) return NextResponse.json({ error: "Order is already paid." }, { status: 400 });

  const phone = String(order.shippingAddress?.phone ?? "").replace(/^0/, "254").replace(/\D/g, "");
  if (!phone) return NextResponse.json({ error: "No customer phone on file." }, { status: 400 });

  const r = await initiateStkPush({
    phone, amount: order.total, accountRef: `NCS-${String(order._id).slice(-6).toUpperCase()}`,
    description: "NairobiComradeStore order",
  });

  if (!r.ok) return NextResponse.json({ ok: false, reason: r.reason }, { status: 400 });

  order.paymentResult = { id: r.checkoutRequestId, status: "Pending" };
  order.statusHistory.push({ status: order.status, timestamp: new Date(), note: "M-Pesa payment requested by admin" });
  await order.save();

  await Notification.create({
    user: order.user, type: "order",
    title: "Complete your payment",
    message: "We've sent an M-Pesa prompt to your phone. Enter your PIN to pay for your order.",
    link: `/account/orders/${order._id}`,
  });

  return NextResponse.json({ ok: true, checkoutRequestId: r.checkoutRequestId });
}
