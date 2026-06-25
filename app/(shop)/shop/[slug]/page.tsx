import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Store, Tag } from "lucide-react";
import { getShopBySlug, getProductsByShop } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";
import { TrackView } from "@/components/shared/track-view";
import { formatKsh } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  return { title: shop ? `${shop.name} — NairobiComradeStore` : "Shop" };
}

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();
  const products = await getProductsByShop(slug);
  const color = shop.headerColor || "#c96442";

  return (
    <div>
      <TrackView type="view_shop" slug={shop.slug} name={shop.name} />
      {/* Coloured shop header — unique to each shop */}
      <header className="relative overflow-hidden" style={{ backgroundColor: color }}>
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.12), transparent 60%)" }} />
        <div className="relative mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:px-8 md:py-14">
          <div className="size-20 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-white/10 md:size-24">
            {shop.logo
              ? <ImageWithFallback src={shop.logo} alt={shop.name} wrapperClassName="h-full w-full" sizes="96px" />
              : <span className="grid h-full w-full place-items-center text-white"><Store className="size-8" /></span>}
          </div>
          <div className="min-w-0">
            <Link href="/shops" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white"><ArrowLeft className="size-3.5" /> All shops</Link>
            <h1 className="mt-1 font-serif text-3xl text-white md:text-4xl">{shop.name}</h1>
            {shop.blurb && <p className="mt-1 max-w-xl text-sm text-white/85">{shop.blurb}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-white">{products.length} products</span>
              {shop.bagFee > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-white"><Tag className="size-3" /> Bag fee {formatKsh(shop.bagFee)}</span>}
              {shop.discountPct > 0 && <span className="rounded-full bg-white/15 px-2.5 py-1 text-white">{shop.discountPct}% off</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center text-sm text-muted-foreground">This shop has no products yet.</div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
