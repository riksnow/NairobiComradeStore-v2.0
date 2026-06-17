import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { User } = await getModels();
  const docs = await User.find().sort({ createdAt: -1 }).select("-password -twoFactorSecret -resetToken").lean();
  return NextResponse.json(serialize(docs));
}
