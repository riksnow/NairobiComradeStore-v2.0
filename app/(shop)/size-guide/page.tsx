"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SizeGuideContent } from "@/components/product/size-guide-content";

export default function SizeGuidePage() {
  const [tab, setTab] = useState<"fashion" | "shoes">("fashion");

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8 md:px-8">
      <h1 className="font-serif text-2xl text-foreground md:text-3xl">Size guide</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Find your fit. Measurements are a guide — when between sizes, size up.
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-border p-1">
        {(
          [
            { k: "fashion", label: "Clothing" },
            { k: "shoes", label: "Shoes" },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm transition-colors",
              tab === t.k ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <SizeGuideContent category={tab} />
      </div>
    </div>
  );
}
