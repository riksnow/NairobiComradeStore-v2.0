import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

/**
 * Plain CSS-driven grid. Each card fades/lifts in on mount via a CSS keyframe
 * (not a scroll/viewport trigger), so cards are always visible — including when
 * the list is swapped client-side by the search filters. A JS/observer-based
 * reveal could leave newly-mounted cards stuck at opacity:0; CSS can't.
 */
export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7",
        className
      )}
    >
      {products.map((p, i) => (
        <div key={p.id} className="ncs-card-in" style={{ animationDelay: `${Math.min(i * 28, 340)}ms` }}>
          <ProductCard product={p} />
        </div>
      ))}
      <style>{`
        @keyframes ncs-card-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .ncs-card-in { opacity: 0; animation: ncs-card-in 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .ncs-card-in { opacity: 1; animation: none; } }
      `}</style>
    </div>
  );
}
