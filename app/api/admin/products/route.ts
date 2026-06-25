import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Product } = await getModels();
  const docs = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(serialize(docs));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  if (!b.name || typeof b.price !== "number" || !b.category) {
    return NextResponse.json({ error: "Name, price and category are required." }, { status: 400 });
  }
  const { Product } = await getModels();
  const slug = (b.slug ? slugify(b.slug) : slugify(b.name)) + "-" + Math.random().toString(36).slice(2, 6);
  const doc = await Product.create({
    name: b.name, slug, description: b.description ?? "", price: b.price, listPrice: b.listPrice,
    images: b.images ?? [], category: b.category, shop: b.shop || undefined, brand: b.brand, tags: b.tags ?? [],
    sizes: b.sizes ?? [], colors: b.colors ?? [],
    variantLabel: b.variantLabel || undefined,
    variants: Array.isArray(b.variants) ? b.variants : [],
    countInStock: b.countInStock ?? 0,
    isPublished: b.isPublished ?? true, isFeatured: b.isFeatured ?? false,
    flashSale: b.flashSale ?? false, flashSalePrice: b.flashSalePrice,
    flashSaleEnd: b.flashSaleEnd ? new Date(b.flashSaleEnd) : undefined,
  });
  return NextResponse.json(serialize(doc));
}
