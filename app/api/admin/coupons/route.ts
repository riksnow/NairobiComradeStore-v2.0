import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Coupon } = await getModels();
  return NextResponse.json(serialize(await Coupon.find().sort({ createdAt: -1 }).lean()));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  if (!b.code || !["percentage", "fixed"].includes(b.type) || typeof b.value !== "number") {
    return NextResponse.json({ error: "Code, type and value are required." }, { status: 400 });
  }
  const { Coupon } = await getModels();
  try {
    const doc = await Coupon.create({
      code: String(b.code).toUpperCase().trim(), type: b.type, value: b.value,
      minOrder: b.minOrder ?? 0, isActive: b.isActive ?? true, maxUses: b.maxUses ?? null,
      expiresAt: b.expiresAt ? new Date(b.expiresAt) : undefined,
    });
    return NextResponse.json(serialize(doc));
  } catch {
    return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });
  }
}
