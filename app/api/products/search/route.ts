import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";
import type { SortKey, SearchFilters } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);

  const filters: SearchFilters = {
    q: sp.get("q") ?? "",
    category: sp.get("category") ?? "",
    min: num("min"),
    max: num("max"),
    minRating: num("rating"),
    flashOnly: sp.get("flash") === "1",
    sort: (sp.get("sort") as SortKey) ?? "newest",
  };

  try {
    const all = await searchProducts(filters);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, Number(sp.get("page") ?? "1")), totalPages);
    const products = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return NextResponse.json({ products, total, page, totalPages });
  } catch {
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 1 }, { status: 200 });
  }
}
