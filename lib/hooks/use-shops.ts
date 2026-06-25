"use client";

import { useEffect, useState } from "react";
import { shops as staticShops, type Shop } from "@/lib/catalog";

export function useShops(): Shop[] {
  const [list, setList] = useState<Shop[]>(staticShops);
  useEffect(() => {
    let active = true;
    fetch("/api/shops").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (active && Array.isArray(d) && d.length) setList(d);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return list;
}
