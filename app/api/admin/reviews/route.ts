import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Review } = await getModels();
  const docs = await Review.find().sort({ createdAt: -1 }).populate("product", "name slug").lean();
  return NextResponse.json(serialize(docs));
}
