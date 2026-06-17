"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useStore } from "@/store/store-context";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";
import { Price } from "@/components/product/price";
import { Stars } from "@/components/shared/stars";
import { StockBadge, stockState } from "@/components/product/stock-badge";

export function QuickViewDialog({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { addToCart, toggleWishlist, isWished } = useStore();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  const out = stockState(product.countInStock) === "out";

  const handleAdd = () => {
    if (product.sizes.length && !size) return setErr("Please select a size.");
    if (product.colors.length && !color) return setErr("Please select a colour.");
    setErr(null);
    addToCart(product, { qty, size, color });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-3xl" label={product.name}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <ImageWithFallback
            src={product.images[img]}
            alt={product.name}
            wrapperClassName="aspect-square w-full rounded-md"
          />
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImg(i)}
                  className={cn(
                    "size-14 overflow-hidden rounded-md border",
                    i === img ? "border-foreground" : "border-border"
                  )}
                >
                  <ImageWithFallback src={src} alt="" wrapperClassName="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand && <p className="eyebrow text-[0.55rem] text-muted-foreground">{product.brand}</p>}
          <h2 className="mt-1 font-serif text-2xl text-foreground">{product.name}</h2>
          <div className="mt-2 flex items-center gap-2">
            {product.numReviews > 0 ? (
              <>
                <Stars rating={product.avgRating} />
                <span className="text-xs text-muted-foreground">({product.numReviews})</span>
              </>
            ) : (
              <span className="text-xs text-primary">New</span>
            )}
          </div>
          <Price product={product} size="lg" className="mt-3" />
          <StockBadge countInStock={product.countInStock} className="mt-2 block" />

          <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{product.description}</p>

          {product.sizes.length > 0 && (
            <Picker label="Size" options={product.sizes} value={size} onChange={setSize} />
          )}
          {product.colors.length > 0 && (
            <Picker label="Colour" options={product.colors} value={color} onChange={setColor} />
          )}

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 items-center rounded-md border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-11 items-center justify-center text-foreground/70" aria-label="Decrease">
                <Minus className="size-4" />
              </button>
              <span className="w-7 text-center text-sm tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="flex size-11 items-center justify-center text-foreground/70" aria-label="Increase">
                <Plus className="size-4" />
              </button>
            </div>
            <Button className="flex-1" onClick={handleAdd} disabled={out}>
              {out ? "Out of stock" : "Add to cart"}
            </Button>
            <button
              onClick={() => toggleWishlist(product)}
              aria-label="Wishlist"
              className="flex size-11 items-center justify-center rounded-md border border-border text-foreground hover:border-foreground"
            >
              <Heart className={cn("size-5", isWished(product.id) && "fill-primary text-primary")} strokeWidth={1.6} />
            </button>
          </div>
          {err && <p className="mt-2 text-xs text-destructive">{err}</p>}

          <Link href={`/product/${product.slug}`} onClick={onClose} className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">
            View full details →
          </Link>
        </div>
      </div>
    </Dialog>
  );
}

function Picker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <p className="eyebrow mb-2 text-[0.55rem] text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              value === o ? "border-foreground bg-foreground text-background" : "border-border text-foreground/80 hover:border-foreground/40"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
