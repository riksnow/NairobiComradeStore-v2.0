import { NextResponse } from "next/server";
import { requireUser } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { resolveUserDoc } from "@/lib/current-user";
import { serialize } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const obj = user.toObject();
  delete obj.password; delete obj.twoFactorSecret;
  return NextResponse.json(serialize(obj));
}

export async function PUT(request: Request) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));

  // Optional password change
  if (body.currentPassword && body.newPassword) {
    if (String(body.newPassword).length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }
    const { User } = await getModels();
    const full = await resolveUserDoc(User, u);
    if (!full?.password || !(await bcrypt.compare(String(body.currentPassword), full.password))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    full.password = await bcrypt.hash(String(body.newPassword), 10);
    await full.save();
    return NextResponse.json({ ok: true, passwordChanged: true });
  }
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (typeof body.phone === "string") update.phone = body.phone.trim();
  if (typeof body.avatar === "string") update.avatar = body.avatar;
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  Object.assign(user, update);
  await user.save();
  const obj = user.toObject();
  delete obj.password; delete obj.twoFactorSecret;
  return NextResponse.json(serialize(obj));
}
