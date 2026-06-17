import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getModels } from "@/lib/db/get-models";

export const dynamic = "force-dynamic";

// Verifies email+password WITHOUT creating a session, and reports whether a
// 2FA code will be required. The real authentication still happens via signIn().
export async function POST(request: Request) {
  const b = await request.json().catch(() => ({}));
  const email = String(b.email ?? "").toLowerCase().trim();
  const password = String(b.password ?? "");
  if (!email || !password) return NextResponse.json({ ok: false }, { status: 200 });
  if (!process.env.MONGODB_URI) return NextResponse.json({ ok: true, twoFactorRequired: false });
  try {
    const { User } = await getModels();
    const user = await User.findOne({ email }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = user as any;
    if (!u?.password || !u.isActive) return NextResponse.json({ ok: false });
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return NextResponse.json({ ok: false });
    return NextResponse.json({ ok: true, twoFactorRequired: Boolean(u.twoFactorEnabled) });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
