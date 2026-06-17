import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireUser } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { resolveUserDoc } from "@/lib/current-user";
import { generateSecret, otpauthURL, verifyToken } from "@/lib/totp";

export const dynamic = "force-dynamic";

// GET — begin setup: generate a secret + QR for an authenticator app.
export async function GET() {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.twoFactorEnabled) return NextResponse.json({ enabled: true });

  const secret = generateSecret();
  user.twoFactorSecret = secret; // staged until verified
  await user.save();

  const otpauth = otpauthURL(user.email, secret);
  const qr = await QRCode.toDataURL(otpauth);
  return NextResponse.json({ enabled: false, secret, otpauth, qr });
}

// POST — verify a code and enable 2FA.
export async function POST(request: Request) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await request.json().catch(() => ({}));
  const token = String(b.token ?? "");
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!user.twoFactorSecret) return NextResponse.json({ error: "Start setup first." }, { status: 400 });
  if (!verifyToken(token, user.twoFactorSecret)) {
    return NextResponse.json({ error: "That code is incorrect. Try again." }, { status: 400 });
  }
  user.twoFactorEnabled = true;
  await user.save();
  return NextResponse.json({ ok: true, enabled: true });
}

// DELETE — disable 2FA (requires a valid code to confirm ownership).
export async function DELETE(request: Request) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await request.json().catch(() => ({}));
  const token = String(b.token ?? "");
  const { User } = await getModels();
  const user = await resolveUserDoc(User, u);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.twoFactorEnabled && user.twoFactorSecret && !verifyToken(token, user.twoFactorSecret)) {
    return NextResponse.json({ error: "Enter a valid code to disable 2FA." }, { status: 400 });
  }
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();
  return NextResponse.json({ ok: true, enabled: false });
}
