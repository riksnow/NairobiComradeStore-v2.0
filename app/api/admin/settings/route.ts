import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Setting } = await getModels();
  let doc = await Setting.findOne({ key: "store" }).lean();
  if (!doc) doc = (await Setting.create({ key: "store" })).toObject();
  return NextResponse.json(serialize(doc));
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  delete b._id; delete b.key;
  const { Setting } = await getModels();
  const doc = await Setting.findOneAndUpdate({ key: "store" }, b, { new: true, upsert: true }).lean();
  return NextResponse.json(serialize(doc));
}
