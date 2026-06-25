import { NextResponse } from "next/server";
import { getModels } from "@/lib/db/get-models";

export const dynamic = "force-dynamic";

const TYPES = new Set(["pageview", "search", "view_product", "view_shop"]);
const clip = (v: unknown, n = 160) => (typeof v === "string" ? v.trim().slice(0, n) : undefined);

export async function POST(request: Request) {
  if (!process.env.MONGODB_URI) return NextResponse.json({ ok: true, persisted: false });
  try {
    const b = await request.json().catch(() => ({}));
    if (!TYPES.has(b.type)) return NextResponse.json({ ok: false }, { status: 400 });
    // Don't record admin/internal navigation as visitor traffic.
    const path = clip(b.path, 300);
    if (b.type === "pageview" && path && (path.startsWith("/admin") || path.startsWith("/api"))) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const { Event } = await getModels();
    await Event.create({
      type: b.type,
      query: b.type === "search" ? clip(b.query, 120)?.toLowerCase() : undefined,
      slug: clip(b.slug, 160),
      name: clip(b.name, 160),
      path,
      visitorId: clip(b.visitorId, 80),
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ ok: true, persisted: false });
  }
}
