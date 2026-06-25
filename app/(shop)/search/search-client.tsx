"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { type SortKey, type Product, type Category } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "best-selling", label: "Best selling" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Top rated" },
];

const RATINGS = [4, 3, 2];

type Filters = {
  q: string;
  category: string;
  min?: number;
  max?: number;
  minRating?: number;
  flashOnly: boolean;
  sort: SortKey;
  page: number;
};

type Data = { products: Product[]; total: number; page: number; totalPages: number };

function toQS(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category) p.set("category", f.category);
  if (f.min != null) p.set("min", String(f.min));
  if (f.max != null) p.set("max", String(f.max));
  if (f.minRating != null) p.set("rating", String(f.minRating));
  if (f.flashOnly) p.set("flash", "1");
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  if (f.page > 1) p.set("page", String(f.page));
  return p.toString();
}

export function SearchClient({
  products, total, page, totalPages, query, cats, initial,
}: {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  cats: Category[];
  initial: Omit<Filters, "q"> & { q: string };
}) {
  const [filters, setFilters] = useState<Filters>({ ...initial, q: query });
  const [data, setData] = useState<Data>({ products, total, page, totalPages });
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const reqId = useRef(0);

  // Fetch results whenever filters change (after the initial server render).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const id = ++reqId.current;
    const qs = toQS(filters);
    // Keep the URL shareable/back-friendly without triggering a full RSC reload.
    window.history.replaceState(null, "", qs ? `/search?${qs}` : "/search");
    setLoading(true);
    fetch(`/api/products/search?${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Data | null) => {
        if (id !== reqId.current) return; // ignore out-of-order responses
        if (d) setData(d);
        setLoading(false);
      })
      .catch(() => { if (id === reqId.current) setLoading(false); });
  }, [filters]);

  const apply = (patch: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...patch, ...( "page" in patch ? {} : { page: 1 }) }));

  const clearAll = () => { setFiltersOpen(false); setFilters((f) => ({ q: f.q, category: "", flashOnly: false, sort: "newest", page: 1 })); };

  const { category, min, max, minRating, flashOnly, sort } = filters;
  const activeCount = [category, min, max, minRating, flashOnly].filter(Boolean).length;

  const panel = (
    <>
      <FilterGroup label="Category">
        <div className="space-y-1.5">
          <Radio checked={!category} onChange={() => apply({ category: "" })} label="All categories" />
          {cats.map((c) => (
            <Radio key={c.slug} checked={category === c.slug} onChange={() => apply({ category: c.slug })} label={c.name} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Price (Ksh)">
        <div className="flex items-center gap-2">
          <input
            type="number" inputMode="numeric" placeholder="Min" defaultValue={min ?? ""}
            onBlur={(e) => apply({ min: e.target.value ? Number(e.target.value) : undefined })}
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number" inputMode="numeric" placeholder="Max" defaultValue={max ?? ""}
            onBlur={(e) => apply({ max: e.target.value ? Number(e.target.value) : undefined })}
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </FilterGroup>

      <FilterGroup label="Rating">
        <div className="space-y-1.5">
          {RATINGS.map((r) => (
            <Radio key={r} checked={minRating === r} onChange={() => apply({ minRating: minRating === r ? undefined : r })} label={`${r}★ & up`} />
          ))}
        </div>
      </FilterGroup>

      <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={flashOnly}
          onChange={(e) => apply({ flashOnly: e.target.checked })}
          className="size-4 accent-[var(--primary)]"
        />
        Flash sale only
      </label>
    </>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">{filters.q ? `Results for “${filters.q}”` : "Explore"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.total} {data.total === 1 ? "product" : "products"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground lg:hidden"
          >
            <SlidersHorizontal className="size-4" /> Filters
            {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.6rem] font-medium text-primary-foreground">{activeCount}</span>}
          </button>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => apply({ sort: e.target.value as SortKey })}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {SORTS.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="hidden h-max rounded-xl border border-border bg-card p-5 lg:block">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <SlidersHorizontal className="size-4" /> Filters
            </span>
            {activeCount > 0 && (
              <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <X className="size-3" /> Clear
              </button>
            )}
          </div>
          {panel}
        </aside>

        <div>
          <div className={loading ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
            {data.products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card py-20 text-center">
                <p className="font-serif text-lg text-foreground">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try removing a filter or searching for something else.</p>
              </div>
            ) : (
              <ProductGrid products={data.products} />
            )}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => { apply({ page: data.page - 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Previous</Button>
              <span className="px-3 text-sm text-muted-foreground">Page {data.page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} onClick={() => { apply({ page: data.page + 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Next</Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[90] lg:hidden"
          >
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setFiltersOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-serif text-lg text-foreground">
                  <SlidersHorizontal className="size-5" /> Filters
                </span>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close"><X className="size-6 text-foreground" /></button>
              </div>
              {panel}
              <div className="mt-6 flex gap-2">
                {activeCount > 0 && <Button variant="outline" className="flex-1" onClick={clearAll}>Clear all</Button>}
                <Button className="flex-1" onClick={() => setFiltersOpen(false)}>Show {data.total} {data.total === 1 ? "result" : "results"}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border py-4 first:border-t-0 first:pt-0">
      <p className="eyebrow mb-3 text-[0.6rem] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} className="flex w-full items-center gap-2 text-left text-sm text-foreground/90 hover:text-foreground">
      <span className={`grid size-4 place-items-center rounded-full border ${checked ? "border-primary" : "border-foreground/30"}`}>
        {checked && <span className="size-2 rounded-full bg-primary" />}
      </span>
      {label}
    </button>
  );
}
