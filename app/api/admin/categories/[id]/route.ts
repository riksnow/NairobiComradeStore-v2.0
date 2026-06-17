import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const { Category } = await getModels();

  const update: Record<string, unknown> = {};
  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.blurb === "string") update.blurb = b.blurb;
  if (typeof b.image === "string") update.image = b.image;
  if (typeof b.order === "number") update.order = b.order;
  if (typeof b.isActive === "boolean") update.isActive = b.isActive;
  if (typeof b.slug === "string" && b.slug.trim()) {
    const slug = slugify(b.slug);
    const clash = await Category.findOne({ slug, _id: { $ne: id } }).select("_id").lean();
    if (clash) return NextResponse.json({ error: "Another category already uses that slug." }, { status: 409 });
    update.slug = slug;
  }

  const doc = await Category.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(doc));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { Category, Product } = await getModels();
  const cat = await Category.findById(id).lean();
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const count = await Product.countDocuments({ category: (cat as any).slug });
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, productsAffected: count });
}
