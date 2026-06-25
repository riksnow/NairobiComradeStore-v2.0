import { TrackView } from "@/components/shared/track-view";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getByCategory, getReviewsForProductSlug, getCategories } from "@/lib/data";
import { ProductDetailClient } from "./product-detail-client";
import { ReviewsSection } from "@/components/product/reviews-section";
import { ProductSection } from "@/components/home/product-section";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} — NairobiComradeStore` : "Product — NairobiComradeStore",
    description: product?.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cat = (await getCategories()).find((c) => c.slug === product.category);
  const productReviews = await getReviewsForProductSlug(slug);
  const related = (await getByCategory(product.category)).filter((p) => p.id !== product.id).slice(0, 7);

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 md:px-8">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3" />
        {cat && (
          <>
            <Link href={`/category/${cat.slug}`} className="hover:text-foreground">{cat.name}</Link>
            <ChevronRight className="size-3" />
          </>
        )}
        <span className="text-foreground/80">{product.name}</span>
      </nav>

      <ProductDetailClient product={product} />
      <TrackView type="view_product" slug={product.slug} name={product.name} />

      <div className="mt-14">
        <h2 className="mb-5 font-serif text-xl text-foreground md:text-2xl">Ratings &amp; reviews</h2>
        <ReviewsSection initial={productReviews} avgRating={product.avgRating} productSlug={slug} />
      </div>

      {related.length > 0 && (
        <div className="mt-8">
          <ProductSection title="You might also like" products={related} />
        </div>
      )}
    </div>
  );
}
