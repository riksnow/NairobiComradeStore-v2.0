import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!process.env.MONGODB_URI) return NextResponse.json({ isPaid: false, status: "Pending" });
  try {
    const { getModels } = await import("@/lib/db/get-models");
    const { Order } = await getModels();
    const doc = await Order.findById(id).select("isPaid status").lean().catch(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = doc as any;
    if (!o) return NextResponse.json({ isPaid: false, status: "Pending" });
    return NextResponse.json({ isPaid: Boolean(o.isPaid), status: o.status });
  } catch {
    return NextResponse.json({ isPaid: false, status: "Pending" });
  }
}
