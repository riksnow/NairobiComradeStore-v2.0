"use client";

import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useStore } from "@/store/store-context";
import { formatKsh } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export function CartSheet() {
  const {
    cartOpen, setCartOpen, lines, subtotal, discount, deliveryFee, total, setQty, removeLine,
  } = useStore();

  return (
    <Drawer
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      title={`Your cart${lines.length ? ` (${lines.length})` : ""}`}
      footer={
        lines.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatKsh(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-primary">−{formatKsh(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-foreground">{formatKsh(deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 font-serif text-lg">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatKsh(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button asChild variant="outline">
                <Link href="/cart" onClick={() => setCartOpen(false)}>View cart</Link>
              </Button>
              <Button asChild>
                <Link href="/checkout" onClick={() => setCartOpen(false)}>Checkout</Link>
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="size-6 text-foreground/70" strokeWidth={1.4} />
          </span>
          <p className="mt-5 font-serif text-lg text-foreground">Your cart is empty</p>
          <Button asChild className="mt-6">
            <Link href="/search" onClick={() => setCartOpen(false)}>Start shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {lines.map((l) => (
              <li key={l.key} className="flex gap-3">
                <Link href={`/product/${l.product.slug}`} onClick={() => setCartOpen(false)} className="w-20 shrink-0">
                  <ImageWithFallback src={l.product.images[0]} alt={l.product.name} wrapperClassName="aspect-square w-full rounded-md border border-border" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-foreground">{l.product.name}</p>
                      {(l.size || l.color) && (
                        <p className="text-[0.7rem] text-muted-foreground">{[l.color, l.size].filter(Boolean).join(" · ")}</p>
                      )}
                    </div>
                    <button onClick={() => removeLine(l.key)} aria-label="Remove" className="text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex h-8 items-center rounded-md border border-border">
                      <button onClick={() => setQty(l.key, l.qty - 1)} className="flex size-8 items-center justify-center text-foreground/70" aria-label="Decrease"><Minus className="size-3" /></button>
                      <span className="w-6 text-center text-xs tabular-nums">{l.qty}</span>
                      <button onClick={() => setQty(l.key, l.qty + 1)} className="flex size-8 items-center justify-center text-foreground/70" aria-label="Increase"><Plus className="size-3" /></button>
                    </div>
                    <span className="text-sm text-foreground">{formatKsh(l.lineTotal)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Drawer>
  );
}
