import { formatKsh, effectivePrice, discountPercent } from "@/lib/utils";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function Price({ product, className, size = "base" }: { product: Product; className?: string; size?: "sm" | "base" | "lg" }) {
  const current = effectivePrice(product);
  const pct = discountPercent(product);
  const original = pct > 0 ? (product.flashSale ? product.price : product.listPrice) : undefined;
  const sizes = { sm: "text-sm", base: "text-base", lg: "text-2xl" } as const;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-serif text-foreground", sizes[size])}>{formatKsh(current)}</span>
      {original && (
        <span className="text-xs text-muted-foreground line-through">{formatKsh(original)}</span>
      )}
      {pct > 0 && (
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-medium text-primary">
          -{pct}%
        </span>
      )}
    </div>
  );
}
