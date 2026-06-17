"use client";

import { useEffect, useState } from "react";
import { categories as staticCategories, type Category } from "@/lib/catalog";

/**
 * Categories for client components. Starts from the built-in list (so there's no
 * flash of empty state) and swaps in the admin-managed categories from the API.
 */
export function useCategories(): Category[] {
  const [cats, setCats] = useState<Category[]>(staticCategories);
  useEffect(() => {
    let active = true;
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active && Array.isArray(d) && d.length) setCats(d); })
      .catch(() => { /* keep static fallback */ });
    return () => { active = false; };
  }, []);
  return cats;
}
