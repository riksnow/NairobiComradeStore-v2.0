import { NextResponse } from "next/server";
import { getProducts, getByCategory, searchProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  try {
    if (q) return NextResponse.json(await searchProducts({ q }));
    if (category) return NextResponse.json(await getByCategory(category));
    return NextResponse.json(await getProducts());
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
