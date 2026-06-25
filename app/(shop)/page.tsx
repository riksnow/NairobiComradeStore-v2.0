import { Hero, type HeroSlide } from "@/components/home/hero";
import { ShopsStrip } from "@/components/home/shops-strip";
import { CategoryTiles } from "@/components/home/category-tiles";
import { ProductSection } from "@/components/home/product-section";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { flashDeals, newArrivals, trending, featured, getBanners, getShops, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

// Curated, feature-led hero banners — each points to a different part of the
// site with its OWN buttons and styling (AliExpress-style).
const FEATURE_SLIDES: HeroSlide[] = [
  {
    id: "f-shops",
    image: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1600&q=80",
    eyebrow: "Many shops, one checkout",
    title: "Shop your favourite stores",
    subtitle: "K-Thrift, Dr. Martens, Glass World, VoltHub & more — each with its own vibe.",
    align: "left", tint: "#3b7d8c",
    buttons: [{ label: "Visit shops", href: "/shops" }, { label: "Glass World", href: "/shop/glass-world", variant: "outline" }],
  },
  {
    id: "f-flash",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
    eyebrow: "Limited time",
    title: "Flash deals, every day",
    subtitle: "Fresh price drops across thousands of products. Blink and they're gone.",
    align: "right", tint: "#c96442",
    buttons: [{ label: "Shop flash deals", href: "/flash-sales" }, { label: "New arrivals", href: "/search?sort=newest", variant: "outline" }],
  },
  {
    id: "f-catalog",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    eyebrow: "Thousands of products",
    title: "Everything you need, delivered",
    subtitle: "Fashion, electronics, home, beauty & sports — browse the full catalogue.",
    align: "center", tint: "#3d3929",
    buttons: [{ label: "Browse all", href: "/search" }, { label: "Categories", href: "/collections", variant: "outline" }],
  },
  {
    id: "f-fashion",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80",
    eyebrow: "Step out in style",
    title: "Fashion & footwear that turns heads",
    subtitle: "From thrifted gems to iconic boots and loafers.",
    align: "left", tint: "#7c3a52",
    buttons: [{ label: "Dr. Martens", href: "/shop/dr-martens" }, { label: "K-Thrift", href: "/shop/k-thrift", variant: "outline" }],
  },
  {
    id: "f-electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
    eyebrow: "Power up",
    title: "Gadgets & electronics",
    subtitle: "Power banks, audio and everyday tech from VoltHub.",
    align: "right", tint: "#1f6f63",
    buttons: [{ label: "Shop VoltHub", href: "/shop/volthub" }, { label: "All electronics", href: "/category/electronics", variant: "outline" }],
  },
];

export default async function HomePage() {
  const [flash, arrivals, trend, feat, banners, shops, allProducts] = await Promise.all([
    flashDeals(), newArrivals(), trending(), featured(), getBanners(), getShops(), getProducts(),
  ]);

  // Merge admin-managed banners (each with its own CTA) with the feature slides.
  const dbSlides: HeroSlide[] = banners.map((b, k) => ({
    id: `b-${b.id}`,
    image: b.image,
    eyebrow: "Featured",
    title: b.title,
    subtitle: b.subtitle,
    align: (["left", "center", "right"] as const)[k % 3],
    tint: "#3d3929",
    buttons: [{ label: b.cta || "Shop now", href: b.link || "/search" }],
  }));

  const slides = [...FEATURE_SLIDES, ...dbSlides];

  return (
    <>
      <Hero slides={slides} />
      <ShopsStrip shops={shops} />

      <CategoryTiles />

      {allProducts.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              {/* <p className="eyebrow text-muted-foreground">Everything in store</p> */}
              <h2 className="font-serif text-2xl text-foreground md:text-3xl">All products</h2>
            </div>
            <Link href="/search" className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <ProductGrid products={allProducts.slice(0, 14)} />
          {allProducts.length > 14 && (
            <div className="mt-10 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/search">Browse all {allProducts.length} products</Link>
              </Button>
            </div>
          )}
        </section>
      )}

      

      {flash.length > 0 && (
        <ProductSection title="Flash deals" products={flash.slice(0, 14)} href="/flash-sales" accent />
      )}
      <ProductSection title="New arrivals" products={arrivals.slice(0, 14)} href="/search?sort=newest" />
      <ProductSection title="Trending now" products={trend.slice(0, 14)} href="/search?sort=best-selling" />
      <ProductSection title="Featured picks" products={feat.slice(0, 14)} href="/collections" />
    </>
  );
}
