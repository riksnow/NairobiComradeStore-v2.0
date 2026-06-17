import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getModels } from "@/lib/db/get-models";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { token, email, password } = await request.json().catch(() => ({}));
  if (!token || !email || String(password ?? "").length < 6) {
    return NextResponse.json({ error: "Invalid request or weak password." }, { status: 400 });
  }
  try {
    const { User } = await getModels();
    const hashed = crypto.createHash("sha256").update(String(token)).digest("hex");
    const user = await User.findOne({
      email: String(email).toLowerCase(),
      resetToken: hashed,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    user.password = await bcrypt.hash(String(password), 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  }
}
