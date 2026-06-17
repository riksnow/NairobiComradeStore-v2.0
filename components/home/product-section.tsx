import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/product-grid";

export function ProductSection({
  title,
  products,
  href,
  accent = false,
}: {
  title: string;
  products: Product[];
  href?: string;
  accent?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
      <div className="mb-5 flex items-end justify-between">
        <h2 className={`font-serif text-xl md:text-2xl ${accent ? "text-primary" : "text-foreground"}`}>{title}</h2>
        {href && (
          <Link href={href} className="group flex items-center gap-1 text-sm text-foreground/70 hover:text-primary">
            See all <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
