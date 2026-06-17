"use client";

import Link from "next/link";
import { Heart, X, ShoppingBag } from "lucide-react";
import { useStore } from "@/store/store-context";
import { formatKsh, effectivePrice } from "@/lib/utils";
import { stockState } from "@/components/product/stock-badge";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export function WishlistSheet() {
  const { wishlistOpen, setWishlistOpen, wishlist, toggleWishlist, addToCart } = useStore();

  return (
    <Drawer
      open={wishlistOpen}
      onClose={() => setWishlistOpen(false)}
      title={`Wishlist${wishlist.length ? ` (${wishlist.length})` : ""}`}
      footer={
        wishlist.length > 0 ? (
          <Button asChild variant="outline" className="w-full">
            <Link href="/wishlist" onClick={() => setWishlistOpen(false)}>View full wishlist</Link>
          </Button>
        ) : undefined
      }
    >
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
            <Heart className="size-6 text-foreground/70" strokeWidth={1.4} />
          </span>
          <p className="mt-5 font-serif text-lg text-foreground">Nothing saved yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any product.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {wishlist.map((p) => {
            const out = stockState(p.countInStock) === "out";
            const needsVariant = p.sizes.length > 0 || p.colors.length > 0;
            return (
              <li key={p.id} className="flex gap-3">
                <Link href={`/product/${p.slug}`} onClick={() => setWishlistOpen(false)} className="w-20 shrink-0">
                  <ImageWithFallback src={p.images[0]} alt={p.name} wrapperClassName="aspect-square w-full rounded-md border border-border" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground">{p.name}</p>
                    <button onClick={() => toggleWishlist(p)} aria-label="Remove" className="text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                  <span className="text-sm text-foreground">{formatKsh(effectivePrice(p))}</span>
                  <div className="mt-auto pt-2">
                    {out ? (
                      <span className="text-xs text-destructive">Out of stock</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => {
                          if (needsVariant) {
                            setWishlistOpen(false);
                            // fall through to product page for variant choice
                            window.location.href = `/product/${p.slug}`;
                          } else {
                            addToCart(p, { silent: true });
                          }
                        }}
                      >
                        <ShoppingBag className="size-3.5" /> Add to cart
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
