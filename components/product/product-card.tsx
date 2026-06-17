"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Eye, Check } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store-context";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";
import { Price } from "@/components/product/price";
import { Stars } from "@/components/shared/stars";
import { StockBadge, stockState } from "@/components/product/stock-badge";
import { QuickViewDialog } from "@/components/product/quick-view-dialog";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWished } = useStore();
  const [quick, setQuick] = useState(false);
  const [added, setAdded] = useState(false);
  const out = stockState(product.countInStock) === "out";
  const needsVariant = product.sizes.length > 0 || product.colors.length > 0;

  const onAdd = () => {
    if (out) return;
    if (needsVariant) {
      setQuick(true);
      return;
    }
    addToCart(product, { silent: true });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <>
      <article className="group flex flex-col">
        <div className="relative overflow-hidden rounded-md border border-border bg-secondary">
          <Link href={`/product/${product.slug}`} aria-label={product.name} className="block aspect-square">
            <ImageWithFallback
              src={product.images[0]}
              alt={product.name}
              wrapperClassName="h-full w-full"
              className={cn("transition-transform duration-700 ease-out group-hover:scale-105", out && "opacity-60")}
            />
          </Link>

          {/* wishlist */}
          <button
            onClick={() => toggleWishlist(product)}
            aria-label="Wishlist"
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
          >
            <Heart className={cn("size-4", isWished(product.id) && "fill-primary text-primary")} strokeWidth={1.6} />
          </button>

          {/* quick view (hover, pointer devices) */}
          <button
            onClick={() => setQuick(true)}
            className="absolute left-2 top-2 hidden items-center gap-1 rounded-full bg-background/85 px-2.5 py-1.5 text-[0.65rem] text-foreground backdrop-blur-sm transition-opacity duration-300 hover:bg-background lg:flex lg:opacity-0 lg:group-hover:opacity-100"
          >
            <Eye className="size-3.5" /> Quick view
          </button>

          {out && (
            <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-1 text-center text-[0.65rem] font-medium text-background">
              Out of stock
            </span>
          )}

          {/* add to cart overlay */}
          {!out && (
            <button
              onClick={onAdd}
              aria-label={`Add ${product.name} to cart`}
              className={cn(
                "absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full shadow-md transition-all",
                added ? "bg-primary text-primary-foreground" : "bg-foreground text-background hover:bg-primary"
              )}
            >
              {added ? <Check className="size-4" /> : <Plus className="size-4" />}
            </button>
          )}
        </div>

        {/* fixed-height info rows so all cards align */}
        <Link href={`/product/${product.slug}`} className="mt-2 block">
          <h3 className="line-clamp-1 text-sm text-foreground">{product.name}</h3>
        </Link>
        <div className="mt-1 h-4">
          {product.numReviews > 0 ? (
            <div className="flex items-center gap-1">
              <Stars rating={product.avgRating} size={12} />
              <span className="text-[0.65rem] text-muted-foreground">({product.numReviews})</span>
            </div>
          ) : (
            <span className="text-[0.65rem] text-primary">New</span>
          )}
        </div>
        <Price product={product} size="sm" className="mt-1" />
        <StockBadge countInStock={product.countInStock} className="mt-1 block" />
      </article>

      <QuickViewDialog product={product} open={quick} onClose={() => setQuick(false)} />
    </>
  );
}
