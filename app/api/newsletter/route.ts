import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({ email: "" }));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }
  if (!process.env.MONGODB_URI) return NextResponse.json({ ok: true, persisted: false });
  try {
    const { getModels } = await import("@/lib/db/get-models");
    const { Subscriber } = await getModels();
    await Subscriber.updateOne(
      { email: email.toLowerCase() },
      { $setOnInsert: { email: email.toLowerCase(), subscribedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ ok: true, persisted: false });
  }
}
