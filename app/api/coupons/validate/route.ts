import { NextResponse } from "next/server";
import { getCoupon } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = (body?.code ?? "").toString();
  const subtotal = Number(body?.subtotal ?? 0);

  const coupon = await getCoupon(code);
  if (!coupon) return NextResponse.json({ valid: false, error: "Invalid code" }, { status: 200 });
  if (subtotal < coupon.minOrder) {
    return NextResponse.json(
      { valid: false, error: `Minimum order is Ksh ${coupon.minOrder.toLocaleString("en-KE")}` },
      { status: 200 }
    );
  }
  const discount =
    coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return NextResponse.json({ valid: true, coupon, discount });
}
