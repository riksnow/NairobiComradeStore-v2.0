import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize, slugify } from "@/lib/utils";
import { shops as staticShops } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Shop } = await getModels();
  if ((await Shop.countDocuments()) === 0) {
    await Shop.insertMany(staticShops.map((s, i) => ({ ...s, order: i, isActive: true, isSuspended: false })));
  }
  const docs = await Shop.find().sort({ order: 1, name: 1 }).lean();
  return NextResponse.json(serialize(docs));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Shop name is required." }, { status: 400 });
  const slug = (b.slug ? slugify(String(b.slug)) : slugify(name)) || slugify(name);
  const { Shop } = await getModels();
  if (await Shop.exists({ slug })) return NextResponse.json({ error: "A shop with that slug already exists." }, { status: 409 });
  const count = await Shop.countDocuments();
  const doc = await Shop.create({
    name, slug, blurb: b.blurb ?? "", logo: b.logo ?? "", banner: b.banner ?? "",
    headerColor: b.headerColor || "#c96442",
    bagFee: Number(b.bagFee) || 0, deliveryFee: typeof b.deliveryFee === "number" ? b.deliveryFee : undefined,
    discountPct: Number(b.discountPct) || 0,
    isActive: b.isActive !== false, isSuspended: Boolean(b.isSuspended), order: count,
  });
  return NextResponse.json(serialize(doc.toObject()));
}
