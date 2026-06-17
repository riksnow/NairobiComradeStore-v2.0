import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/data";
import { getByCategory } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  return {
    title: cat ? `${cat.name} — NairobiComradeStore` : "Category — NairobiComradeStore",
    description: cat?.blurb,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();

  const items = await getByCategory(slug);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
      <Link
        href="/collections"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All categories
      </Link>

      <div className="relative mb-7 overflow-hidden rounded-2xl border border-border">
        <ImageWithFallback
          src={cat.image}
          alt={cat.name}
          wrapperClassName="h-40 md:h-52"
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <h1 className="font-serif text-2xl text-background md:text-4xl">{cat.name}</h1>
          <p className="mt-1 text-sm text-background/80">
            {cat.blurb} · {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Nothing here yet — check back soon.
        </p>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
