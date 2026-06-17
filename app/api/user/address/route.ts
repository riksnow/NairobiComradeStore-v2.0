import { NextResponse } from "next/server";
import { requireUser } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";
import { resolveUserDoc } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json([]);
  return NextResponse.json(serialize(user.addresses ?? []));
}

export async function POST(request: Request) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await request.json().catch(() => ({}));
  if (!b.fullName || !b.phone || !b.street || !b.area) {
    return NextResponse.json({ error: "All address fields are required." }, { status: 400 });
  }
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json({ error: "Sign in again to continue." }, { status: 401 });
  const makeDefault = Boolean(b.isDefault) || user.addresses.length === 0;
  if (makeDefault) user.addresses.forEach((a: { isDefault: boolean }) => (a.isDefault = false));
  user.addresses.push({
    label: b.label, fullName: b.fullName, phone: b.phone, street: b.street,
    area: b.area, city: b.city || "Nairobi", isDefault: makeDefault,
  });
  await user.save();
  return NextResponse.json(serialize(user.addresses));
}
