import { NextResponse } from "next/server";
import { requireUser } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { resolveUserDoc } from "@/lib/current-user";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { Notification, User } = await getModels();
  const userDoc = await resolveUserDoc(User, u);
  if (!userDoc) return NextResponse.json([]);
  const docs = await Notification.find({ user: userDoc._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(serialize(docs));
}

export async function PUT(request: Request) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await request.json().catch(() => ({}));
  const { Notification, User } = await getModels();
  const userDoc = await resolveUserDoc(User, u);
  if (!userDoc) return NextResponse.json([]);
  if (b.all) {
    await Notification.updateMany({ user: userDoc._id, isRead: false }, { isRead: true });
  } else if (b.id) {
    await Notification.updateOne({ _id: b.id, user: userDoc._id }, { isRead: true });
  }
  const docs = await Notification.find({ user: userDoc._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(serialize(docs));
}
