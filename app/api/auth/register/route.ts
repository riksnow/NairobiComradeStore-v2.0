import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getModels } from "@/lib/db/get-models";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");
  const phone = String(body?.phone ?? "").trim() || undefined;

  if (!name || !email.includes("@") || password.length < 6) {
    return NextResponse.json({ error: "Name, valid email and a 6+ character password are required." }, { status: 400 });
  }
  try {
    const { User, Notification } = await getModels();
    const existing = await User.findOne({ email }).lean();
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const user = await User.create({
      name, email, phone,
      password: await bcrypt.hash(password, 10),
      role: "Customer",
      isActive: true,
    });
    await Notification.create({
      user: user._id,
      type: "system",
      title: "Karibu to NairobiComradeStore 🎉",
      message: "Your account is ready. Start exploring deals made for comrades.",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not create account. Try again." }, { status: 500 });
  }
}
