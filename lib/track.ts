"use client";

type TrackPayload = {
  type: "pageview" | "search" | "view_product" | "view_shop";
  query?: string;
  slug?: string;
  name?: string;
  path?: string;
};

const KEY = "ncs_vid";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `v_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function track(payload: TrackPayload): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ ...payload, visitorId: getVisitorId() });
    // keepalive so the request survives navigation
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch { /* ignore */ }
}
