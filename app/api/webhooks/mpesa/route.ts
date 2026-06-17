import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/*
  Safaricom Daraja STK callback. Idempotent: if the order is already paid we do
  nothing, so a duplicate callback can't double-process. Marks paid, advances to
  Processing, and (when wired) sends the processing email + notification.
*/
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const cb = body?.Body?.stkCallback;
  if (!cb) return NextResponse.json({ ResultCode: 0, ResultDesc: "Ignored" });

  if (!process.env.MONGODB_URI) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const { getModels } = await import("@/lib/db/get-models");
    const { Order } = await getModels();
    const checkoutId: string | undefined = cb.CheckoutRequestID;
    const success = cb.ResultCode === 0;
    if (!checkoutId) return NextResponse.json({ ResultCode: 0, ResultDesc: "No id" });

    const order = await Order.findOne({ "paymentResult.id": checkoutId });
    if (!order || order.isPaid) return NextResponse.json({ ResultCode: 0, ResultDesc: "Done" });

    if (success) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "Processing";
      order.statusHistory.push({ status: "Processing", timestamp: new Date(), note: "Payment received (M-Pesa)" });
      await order.save();
    }
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Error logged" });
  }
}
