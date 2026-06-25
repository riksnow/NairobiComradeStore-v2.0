import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { serialize } from "@/lib/utils";
import { isSuperAdmin } from "@/lib/constants";

export const dynamic = "force-dynamic";

// Guards the invariant: there must always be at least one active Admin.
async function wouldRemoveLastAdmin(User: Awaited<ReturnType<typeof getModels>>["User"], targetId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const target: any = await User.findById(targetId).select("role isActive").lean();
  if (!target || target.role !== "Admin") return false;
  const activeAdmins = await User.countDocuments({ role: "Admin", isActive: true });
  return activeAdmins <= 1;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const { User } = await getModels();

  const demoting = b.role && b.role !== "Admin";
  const deactivating = b.isActive === false;
  if ((demoting || deactivating) && (await wouldRemoveLastAdmin(User, id))) {
    return NextResponse.json({ error: "There must be at least one active admin." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const before: any = await User.findById(id).select("role isActive email").lean();
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // The super admin account is fully protected: no role change, no deactivation.
  if (isSuperAdmin(before.email)) {
    const changingRole = b.role && b.role !== before.role;
    const deactivating = b.isActive === false;
    if (changingRole || deactivating) {
      return NextResponse.json({ error: "The super admin account can't be modified." }, { status: 403 });
    }
  }

  const update: Record<string, unknown> = {};
  if (b.role === "Admin" || b.role === "Customer") update.role = b.role;
  if (typeof b.isActive === "boolean") update.isActive = b.isActive;
  const doc = await User.findByIdAndUpdate(id, update, { new: true }).select("-password -twoFactorSecret -resetToken").lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Notify the affected user about meaningful account changes.
  try {
    const { Notification } = await getModels();
    const notes: { title: string; message: string }[] = [];
    if (update.role && update.role !== before.role) {
      notes.push(update.role === "Admin"
        ? { title: "You're now an admin", message: "Your account has been upgraded to admin. You can now access the admin panel." }
        : { title: "Admin access removed", message: "Your account role was changed to customer." });
    }
    if (typeof update.isActive === "boolean" && update.isActive !== before.isActive) {
      notes.push(update.isActive
        ? { title: "Account reactivated", message: "Your account has been reactivated. Welcome back!" }
        : { title: "Account suspended", message: "Your account has been suspended. Contact support if you think this is a mistake." });
    }
    for (const n of notes) {
      await Notification.create({ user: id, type: "system", title: n.title, message: n.message });
    }
  } catch { /* notifications are best-effort */ }

  return NextResponse.json(serialize(doc));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { User } = await getModels();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const target: any = await User.findById(id).select("email").lean();
  if (target && isSuperAdmin(target.email)) {
    return NextResponse.json({ error: "The super admin account can't be deleted." }, { status: 403 });
  }
  if (await wouldRemoveLastAdmin(User, id)) {
    return NextResponse.json({ error: "There must be at least one active admin." }, { status: 400 });
  }
  await User.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
