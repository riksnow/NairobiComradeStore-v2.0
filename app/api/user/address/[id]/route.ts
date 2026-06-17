import { NextResponse } from "next/server";
import { requireUser } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";
import { resolveUserDoc } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json({ error: "Sign in again to continue." }, { status: 401 });
  const addr = user.addresses.id(id);
  if (!addr) return NextResponse.json({ error: "Address not found" }, { status: 404 });
  if (b.setDefault) {
    user.addresses.forEach((a: { isDefault: boolean }) => (a.isDefault = false));
    addr.isDefault = true;
  }
  for (const k of ["label", "fullName", "phone", "street", "area", "city"] as const) {
    if (typeof b[k] === "string") addr.set(k, b[k]);
  }
  await user.save();
  return NextResponse.json(serialize(user.addresses));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json({ error: "Sign in again to continue." }, { status: 401 });
  const addr = user.addresses.id(id);
  const wasDefault = addr?.isDefault;
  addr?.deleteOne();
  if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
  await user.save();
  return NextResponse.json(serialize(user.addresses));
}
