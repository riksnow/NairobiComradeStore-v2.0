import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize, slugify } from "@/lib/utils";
import { categories as staticCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Category } = await getModels();
  // First run: import the built-in categories so the admin can manage them.
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(staticCategories.map((c, i) => ({ ...c, order: i, isActive: true })));
  }
  const docs = await Category.find().sort({ order: 1, name: 1 }).lean();
  return NextResponse.json(serialize(docs));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const slug = (b.slug ? slugify(String(b.slug)) : slugify(name)) || slugify(name);
  const { Category } = await getModels();
  if (await Category.exists({ slug })) return NextResponse.json({ error: "A category with that slug already exists." }, { status: 409 });
  const count = await Category.countDocuments();
  const doc = await Category.create({
    name, slug, blurb: b.blurb ?? "", image: b.image ?? "",
    order: typeof b.order === "number" ? b.order : count,
    isActive: b.isActive !== false,
  });
  return NextResponse.json(serialize(doc.toObject()));
}
