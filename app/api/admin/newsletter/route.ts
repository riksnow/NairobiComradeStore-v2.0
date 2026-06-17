import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getModels } from "@/lib/db/get-models";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { Subscriber } = await getModels();
  const subs = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json({ count: subs.length, subscribers: subs.map((s: any) => ({ email: s.email, subscribedAt: s.subscribedAt })) });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { subject, message } = await request.json().catch(() => ({}));
  if (!subject || !message) return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  const { Subscriber } = await getModels();
  const subs = await Subscriber.find().select("email").lean();
  const html = `<div style="font-family:Georgia,serif;color:#3d3929"><h2 style="color:#c96442">${subject}</h2><p>${String(message).replace(/\n/g, "<br/>")}</p><hr/><p style="font-size:12px;color:#8a8576">NairobiComradeStore — by comrades, for comrades.</p></div>`;
  let sent = 0;
  for (const s of subs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ok = await sendEmail({ to: (s as any).email, subject, html });
    if (ok) sent++;
  }
  return NextResponse.json({ ok: true, attempted: subs.length, sent });
}
