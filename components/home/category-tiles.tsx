import Link from "next/link";
import { getCategoriesWithCounts } from "@/lib/data";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export async function CategoryTiles() {
  const categories = await getCategoriesWithCounts();
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
      <h2 className="mb-5 font-serif text-xl text-foreground md:text-2xl">Shop by category</h2>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="group">
            <div className="relative aspect-square overflow-hidden rounded-md border border-border">
              <ImageWithFallback src={c.image} alt={c.name} wrapperClassName="h-full w-full" className="transition-transform duration-700 group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-foreground/25" />
            </div>
            <p className="mt-2 text-center text-xs font-medium text-foreground md:text-sm">{c.name}</p>
            <p className="text-center text-[0.65rem] text-muted-foreground">{c.count} items</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
