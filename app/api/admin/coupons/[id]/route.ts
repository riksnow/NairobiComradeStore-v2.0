import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  delete b._id;
  if (b.code) b.code = String(b.code).toUpperCase().trim();
  const { Coupon } = await getModels();
  const doc = await Coupon.findByIdAndUpdate(id, b, { new: true }).lean();
  return NextResponse.json(serialize(doc));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { Coupon } = await getModels();
  await Coupon.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
