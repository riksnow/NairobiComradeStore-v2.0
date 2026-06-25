"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

export function TrackView({ type, slug, name }: { type: "view_product" | "view_shop"; slug: string; name: string }) {
  useEffect(() => {
    track({ type, slug, name });
  }, [type, slug, name]);
  return null;
}
