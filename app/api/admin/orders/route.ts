import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Order } = await getModels();
  const docs = await Order.find().sort({ createdAt: -1 }).populate("user", "name email").lean();
  return NextResponse.json(serialize(docs));
}
