import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const { Shop } = await getModels();

  const update: Record<string, unknown> = {};
  for (const k of ["name", "blurb", "logo", "banner", "headerColor"]) if (typeof b[k] === "string") update[k] = b[k];
  for (const k of ["bagFee", "deliveryFee", "discountPct", "order"]) if (typeof b[k] === "number") update[k] = b[k];
  for (const k of ["isActive", "isSuspended"]) if (typeof b[k] === "boolean") update[k] = b[k];
  if (typeof b.slug === "string" && b.slug.trim()) {
    const slug = slugify(b.slug);
    const clash = await Shop.findOne({ slug, _id: { $ne: id } }).select("_id").lean();
    if (clash) return NextResponse.json({ error: "Another shop already uses that slug." }, { status: 409 });
    update.slug = slug;
  }

  const doc = await Shop.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(doc));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { Shop, Product } = await getModels();
  const shop = await Shop.findById(id).lean();
  if (!shop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const count = await Product.countDocuments({ shop: (shop as any).slug });
  await Shop.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, productsAffected: count });
}
