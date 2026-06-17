"use client";

import Link from "next/link";
import { Heart, X, ShoppingBag } from "lucide-react";
import { useStore } from "@/store/store-context";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import { stockState } from "@/components/product/stock-badge";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export default function WishlistPage() {
  const { hydrated, wishlist, toggleWishlist, addToCart } = useStore();

  if (!hydrated) {
    return <div className="mx-auto max-w-[1100px] px-4 py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-20 text-center md:px-8">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-foreground/50">
          <Heart className="size-7" />
        </span>
        <h1 className="mt-5 font-serif text-2xl text-foreground">Your wishlist is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any product to save it for later.</p>
        <Button asChild className="mt-6">
          <Link href="/search">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <h1 className="font-serif text-2xl text-foreground md:text-3xl">Your wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">{wishlist.length} saved {wishlist.length === 1 ? "item" : "items"}</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {wishlist.map((p) => {
          const out = stockState(p.countInStock) === "out";
          const hasVariants = p.sizes.length > 0 || p.colors.length > 0;
          return (
            <div key={p.id} className="flex gap-4 rounded-xl border border-border bg-card p-3">
              <Link href={`/product/${p.slug}`} className="w-24 shrink-0">
                <ImageWithFallback
                  src={p.images[0]}
                  alt={p.name}
                  wrapperClassName="aspect-square rounded-lg"
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <Link href={`/product/${p.slug}`} className="font-medium text-foreground hover:text-primary">
                    {p.name}
                  </Link>
                  <button onClick={() => toggleWishlist(p)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-1">
                  <Price product={p} size="sm" />
                </div>
                <div className="mt-auto pt-3">
                  {hasVariants ? (
                    <Button asChild size="sm" variant="secondary" className="w-full">
                      <Link href={`/product/${p.slug}`}>Choose options</Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={out}
                      onClick={() => addToCart(p, { silent: false })}
                    >
                      <ShoppingBag className="size-4" /> {out ? "Out of stock" : "Add to cart"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
