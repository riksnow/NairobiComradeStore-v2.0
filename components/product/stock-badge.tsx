import { cn } from "@/lib/utils";

export function stockState(countInStock: number) {
  if (countInStock <= 0) return "out" as const;
  if (countInStock <= 5) return "low" as const;
  return "in" as const;
}

export function StockBadge({ countInStock, className }: { countInStock: number; className?: string }) {
  const s = stockState(countInStock);
  if (s === "in") return <span className={cn("text-[0.7rem] text-muted-foreground", className)}>In stock</span>;
  if (s === "low")
    return <span className={cn("text-[0.7rem] font-medium text-primary", className)}>Only {countInStock} left</span>;
  return <span className={cn("text-[0.7rem] font-medium text-destructive", className)}>Out of stock</span>;
}
