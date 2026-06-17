"use client";

import { useEffect, type RefObject } from "react";

/** Calls `onAway` when a pointer/touch/keydown(Escape) happens outside `ref`. */
export function useClickAway<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onAway: () => void,
  active = true
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: Event) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) onAway();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onAway();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onAway, active]);
}
