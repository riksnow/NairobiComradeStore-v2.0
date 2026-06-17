import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const { Review, recalcProductRating } = await getModels();
  const review = await Review.findByIdAndUpdate(id, { isApproved: Boolean(b.isApproved) }, { new: true });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await recalcProductRating(review.product);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { Review, recalcProductRating } = await getModels();
  const review = await Review.findById(id);
  if (review) {
    const productId = review.product;
    await review.deleteOne();
    await recalcProductRating(productId);
  }
  return NextResponse.json({ ok: true });
}
