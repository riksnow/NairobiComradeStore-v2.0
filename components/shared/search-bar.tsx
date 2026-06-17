"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, TrendingUp, Clock, Sparkles } from "lucide-react";
import { suggest, trending, type Product } from "@/lib/catalog";
import { useCategories } from "@/lib/hooks/use-categories";
import { formatKsh, effectivePrice } from "@/lib/utils";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

const RECENT_KEY = "ncs_recent_searches";

export function SearchBar({ onNavigate, autoFocus }: { onNavigate?: () => void; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const categories = useCategories();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    if (autoFocus) {
      setOpen(true);
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  // debounced live results
  useEffect(() => {
    const t = setTimeout(() => {
      setResults(q.trim() ? suggest(q, 6) : []);
    }, 160);
    return () => clearTimeout(t);
  }, [q]);

  // close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const persistRecent = (term: string) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 8);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    persistRecent(t);
    setOpen(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };

  const removeRecent = (term: string) => {
    const next = recent.filter((r) => r !== term);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const popular = trending(5);

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 focus-within:border-primary">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && go(q)}
          placeholder="Search products, brands…"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          aria-label="Search"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear" className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover shadow-[0_24px_60px_rgba(61,57,41,0.16)]">
          {q.trim() ? (
            results.length ? (
              <ul className="max-h-[60vh] overflow-y-auto py-2">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => {
                        persistRecent(q);
                        setOpen(false);
                        onNavigate?.();
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-accent"
                    >
                      <div className="size-11 shrink-0 overflow-hidden rounded-md border border-border">
                        <ImageWithFallback src={p.images[0]} alt={p.name} wrapperClassName="h-full w-full" />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{p.name}</span>
                      <span className="shrink-0 text-sm text-foreground">{formatKsh(effectivePrice(p))}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <button onClick={() => go(q)} className="w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-accent">
                    See all results for “{q}”
                  </button>
                </li>
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No matches for “{q}”.</p>
            )
          ) : (
            <div className="py-2">
              {recent.length > 0 && (
                <div className="px-2 pb-2">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="eyebrow flex items-center gap-1.5 text-[0.55rem] text-muted-foreground">
                      <Clock className="size-3" /> Recent
                    </span>
                    <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-foreground">
                      Clear all
                    </button>
                  </div>
                  {recent.map((r) => (
                    <div key={r} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent">
                      <button onClick={() => go(r)} className="flex-1 text-left text-sm text-foreground">{r}</button>
                      <button onClick={() => removeRecent(r)} aria-label="Remove" className="text-muted-foreground hover:text-foreground">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="px-3 pb-1">
                <span className="eyebrow flex items-center gap-1.5 px-1 py-1.5 text-[0.55rem] text-muted-foreground">
                  <Sparkles className="size-3" /> Popular right now
                </span>
                <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                  {categories.slice(0, 6).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      onClick={() => { setOpen(false); onNavigate?.(); }}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/80 transition hover:border-primary hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="px-2">
                <span className="eyebrow flex items-center gap-1.5 px-2 py-1.5 text-[0.55rem] text-muted-foreground">
                  <TrendingUp className="size-3" /> Trending products
                </span>
                {popular.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => { setOpen(false); onNavigate?.(); }}
                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
                  >
                    <div className="size-9 shrink-0 overflow-hidden rounded-md border border-border">
                      <ImageWithFallback src={p.images[0]} alt={p.name} wrapperClassName="h-full w-full" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
