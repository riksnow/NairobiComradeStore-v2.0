import { Suspense } from "react";
import { searchProducts, getCategories } from "@/lib/data";
import type { SortKey, SearchFilters } from "@/lib/catalog";
import { SearchClient } from "./search-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search — NairobiComradeStore" };

const PAGE_SIZE = 24;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string): string | undefined => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = get("q") ?? "";
  const category = get("category") ?? "";
  const min = get("min") ? Number(get("min")) : undefined;
  const max = get("max") ? Number(get("max")) : undefined;
  const minRating = get("rating") ? Number(get("rating")) : undefined;
  const flashOnly = get("flash") === "1";
  const sort = (get("sort") as SortKey) ?? "newest";
  const page = Math.max(1, Number(get("page") ?? "1"));

  const filters: SearchFilters = { q, category, min, max, minRating, flashOnly, sort };
  const [all, cats] = await Promise.all([searchProducts(filters), getCategories()]);

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1500px] px-4 py-20 text-center text-sm text-muted-foreground md:px-8">
          Loading…
        </div>
      }
    >
      <SearchClient products={paged} total={total} page={current} totalPages={totalPages} query={q} cats={cats} />
    </Suspense>
  );
}
