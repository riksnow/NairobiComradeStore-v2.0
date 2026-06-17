import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Banner } = await getModels();
  return NextResponse.json(serialize(await Banner.find().sort({ sortOrder: 1 }).lean()));
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  if (!b.title || !b.image) return NextResponse.json({ error: "Title and image are required." }, { status: 400 });
  const { Banner } = await getModels();
  const doc = await Banner.create({
    title: b.title, subtitle: b.subtitle, image: b.image, link: b.link,
    isActive: b.isActive ?? true, sortOrder: b.sortOrder ?? 0,
  });
  return NextResponse.json(serialize(doc));
}
