"use client";

import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";
import { Stagger, StaggerItem } from "@/components/primitives/reveal";
import { cn } from "@/lib/utils";

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <Stagger
      gap={0.04}
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7",
        className
      )}
    >
      {products.map((p) => (
        <StaggerItem key={p.id}>
          <ProductCard product={p} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
