"use client";

import { useState } from "react";
import { Heart, Minus, Plus, Check, Ruler, Truck, RotateCcw } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useStore } from "@/store/store-context";
import { Price } from "@/components/product/price";
import { StockBadge, stockState } from "@/components/product/stock-badge";
import { Stars } from "@/components/shared/stars";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Accordion } from "@/components/ui/accordion";
import { SizeGuideContent } from "@/components/product/size-guide-content";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";
import { cn } from "@/lib/utils";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWished } = useStore();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const out = stockState(product.countInStock) === "out";
  const wished = isWished(product.id);

  const handleAdd = () => {
    if (out) return;
    if (product.sizes.length && !size) return setErr("Please select a size.");
    if (product.colors.length && !color) return setErr("Please select a colour.");
    setErr(null);
    addToCart(product, { qty, size, color, silent: true });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-10">
      {/* Gallery */}
      <div>
        <ImageWithFallback
          src={product.images[img] ?? product.images[0]}
          alt={product.name}
          wrapperClassName="aspect-square rounded-2xl border border-border"
          className="h-full w-full object-cover"
          priority
        />
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {product.images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setImg(i)}
                className={cn(
                  "size-16 overflow-hidden rounded-lg border transition-colors md:size-20",
                  i === img ? "border-primary" : "border-border hover:border-foreground/30"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <ImageWithFallback
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  wrapperClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.brand && (
          <p className="eyebrow text-muted-foreground">{product.brand}</p>
        )}
        <h1 className="mt-1 font-serif text-2xl text-foreground md:text-3xl">{product.name}</h1>

        <div className="mt-2 flex items-center gap-3">
          {product.numReviews > 0 ? (
            <span className="flex items-center gap-1.5">
              <Stars rating={product.avgRating} />
              <span className="text-sm text-muted-foreground">
                {product.avgRating.toFixed(1)} · {product.numReviews} reviews
              </span>
            </span>
          ) : (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-foreground/70">New</span>
          )}
        </div>

        <div className="mt-4">
          <Price product={product} size="lg" />
        </div>

        <div className="mt-3">
          <StockBadge countInStock={product.countInStock} />
        </div>

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow text-[0.6rem] text-muted-foreground">Size</span>
              <button
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Ruler className="size-3.5" /> Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-11 rounded-md border px-3 py-2 text-sm transition-colors",
                    size === s
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-foreground/80 hover:border-foreground/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colours */}
        {product.colors.length > 0 && (
          <div className="mt-5">
            <span className="eyebrow mb-2 block text-[0.6rem] text-muted-foreground">Colour</span>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    color === c
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-foreground/80 hover:border-foreground/30"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Qty + actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid size-11 place-items-center text-foreground/70 hover:text-foreground"
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="grid size-11 place-items-center text-foreground/70 hover:text-foreground"
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button onClick={handleAdd} disabled={out} className="flex-1 min-w-44">
            {added ? (
              <>
                <Check className="size-4" /> Added to cart
              </>
            ) : out ? (
              "Out of stock"
            ) : (
              "Add to cart"
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleWishlist(product)}
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart className={cn("size-4", wished && "fill-primary text-primary")} />
          </Button>
        </div>

        {err && <p className="mt-2 text-sm text-destructive">{err}</p>}

        {/* Trust row */}
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-4 text-primary" /> Flat Ksh 250 delivery in Nairobi
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RotateCcw className="size-4 text-primary" /> 7-day returns
          </span>
        </div>

        {/* Details */}
        <div className="mt-6">
          <Accordion
            items={[
              { title: "Description", content: <p>{product.description}</p> },
              {
                title: "Delivery & returns",
                content: (
                  <p>
                    Same-day or next-day delivery within Nairobi at a
                    flat Ksh 250 fee. Pay on delivery with cash or via M-Pesa. Easy 7-day returns on
                    unused items.
                  </p>
                ),
              },
              {
                title: "Payment",
                content: <p>Pay with M-Pesa (STK push to your phone) or Cash on Delivery.</p>,
              },
            ]}
          />
        </div>
      </div>

      {product.sizes.length > 0 && (
        <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} label="Size guide">
          <SizeGuideContent category={product.category} />
        </Dialog>
      )}
    </div>
  );
}
