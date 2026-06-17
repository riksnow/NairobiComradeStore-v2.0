import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  if (b.flashSaleEnd) b.flashSaleEnd = new Date(b.flashSaleEnd);
  delete b._id; delete b.slug;
  const { Product } = await getModels();
  const doc = await Product.findByIdAndUpdate(id, b, { new: true }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(doc));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { Product, Review } = await getModels();
  await Product.findByIdAndDelete(id);
  await Review.deleteMany({ product: id });
  return NextResponse.json({ ok: true });
}
