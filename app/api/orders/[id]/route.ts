import { NextResponse } from "next/server";
import { serialize } from "@/lib/utils";
import { requireUser } from "@/lib/admin-guard";
import { resolveUserDoc } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!process.env.MONGODB_URI) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const { getModels } = await import("@/lib/db/get-models");
    const { Order } = await getModels();
    const doc = await Order.findById(id).lean().catch(() => null);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(serialize(doc));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// PATCH — the order owner switches an UNPAID order to Cash on Delivery
// (used when an M-Pesa prompt isn't completed).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await request.json().catch(() => ({}));
  if (b.paymentMethod !== "Cash on Delivery") {
    return NextResponse.json({ error: "Unsupported change." }, { status: 400 });
  }
  try {
    const { getModels } = await import("@/lib/db/get-models");
    const { Order, User } = await getModels();
    const userDoc = await resolveUserDoc(User, u);
    if (!userDoc) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const order = await Order.findById(id);
    if (!order || String(order.user) !== String(userDoc._id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (order.isPaid) return NextResponse.json({ error: "Order is already paid." }, { status: 400 });
    order.paymentMethod = "Cash on Delivery";
    order.statusHistory.push({ status: order.status, timestamp: new Date(), note: "Switched to Cash on Delivery" });
    await order.save();
    return NextResponse.json(serialize(order.toObject()));
  } catch {
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }
}
