import { NextResponse } from "next/server";
import { suggest, trending } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  try {
    const results = q ? await suggest(q, 6) : [];
    const popular = await trending(6);
    return NextResponse.json({ results, popular });
  } catch {
    return NextResponse.json({ results: [], popular: [] });
  }
}
