import { NextResponse } from "next/server";
import crypto from "crypto";
import { getModels } from "@/lib/db/get-models";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({ email: "" }));
  // Always respond ok (don't reveal whether an account exists).
  if (typeof email !== "string" || !email.includes("@")) return NextResponse.json({ ok: true });
  try {
    const { User } = await getModels();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await user.save();
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const link = `${base}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
      await sendEmail({
        to: user.email,
        subject: "Reset your NairobiComradeStore password",
        html: `<div style="font-family:Georgia,serif;color:#3d3929"><h2 style="color:#c96442">Reset your password</h2><p>Click below to choose a new password (valid for 1 hour):</p><p><a href="${link}" style="color:#c96442">Reset password</a></p></div>`,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
