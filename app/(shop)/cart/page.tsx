"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from "lucide-react";
import { useStore } from "@/store/store-context";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";
import { formatKsh } from "@/lib/utils";

export default function CartPage() {
  const {
    hydrated,
    lines,
    subtotal,
    deliveryFee,
    discount,
    total,
    setQty,
    removeLine,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useStore();
  const [code, setCode] = useState("");

  if (!hydrated) {
    return <div className="mx-auto max-w-[1100px] px-4 py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-20 text-center md:px-8">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-foreground/50">
          <ShoppingBag className="size-7" />
        </span>
        <h1 className="mt-5 font-serif text-2xl text-foreground">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a few things and they’ll show up here.</p>
        <Button asChild className="mt-6">
          <Link href="/search">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <h1 className="font-serif text-2xl text-foreground md:text-3xl">Your cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">{lines.length} {lines.length === 1 ? "line" : "lines"}</p>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lines */}
        <div className="divide-y divide-border border-y border-border">
          {lines.map((l) => (
            <div key={l.key} className="flex gap-4 py-5">
              <Link href={`/product/${l.product.slug}`} className="w-24 shrink-0">
                <ImageWithFallback
                  src={l.product.images[0]}
                  alt={l.product.name}
                  wrapperClassName="aspect-square rounded-lg border border-border"
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link href={`/product/${l.product.slug}`} className="font-medium text-foreground hover:text-primary">
                    {l.product.name}
                  </Link>
                  <span className="whitespace-nowrap font-medium text-foreground">{formatKsh(l.lineTotal)}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[l.size, l.color].filter(Boolean).join(" · ") || "—"} · {formatKsh(l.unitPrice)} each
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button onClick={() => setQty(l.key, l.qty - 1)} className="grid size-9 place-items-center text-foreground/70 hover:text-foreground" aria-label="Decrease">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm">{l.qty}</span>
                    <button onClick={() => setQty(l.key, l.qty + 1)} className="grid size-9 place-items-center text-foreground/70 hover:text-foreground" aria-label="Increase">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeLine(l.key)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-max rounded-xl border border-border bg-card p-6">
          {/* Coupon */}
          <div className="mb-5">
            {coupon ? (
              <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Tag className="size-3.5 text-primary" /> {coupon.code}
                </span>
                <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Coupon code"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm uppercase focus:border-primary focus:outline-none"
                />
                <Button size="sm" variant="secondary" onClick={() => applyCoupon(code)}>Apply</Button>
              </div>
            )}
            {couponError && <p className="mt-1.5 text-xs text-destructive">{couponError}</p>}
            <p className="mt-1.5 text-[0.7rem] text-muted-foreground">Try KARIBU10 · COMRADE500 · FLASH15</p>
          </div>

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Subtotal" value={formatKsh(subtotal)} />
            {discount > 0 && <Row label="Discount" value={`− ${formatKsh(discount)}`} accent />}
            <Row label="Delivery" value={formatKsh(deliveryFee)} />
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium text-foreground">
              <span>Total</span>
              <span>{formatKsh(total)}</span>
            </div>
          </dl>

          <Button asChild className="mt-5 w-full">
            <Link href="/checkout">Checkout <ArrowRight className="size-4" /></Link>
          </Button>
          <Link href="/search" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? "text-primary" : "text-foreground"}>{value}</dd>
    </div>
  );
}
