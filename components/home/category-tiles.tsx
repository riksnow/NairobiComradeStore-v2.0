import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoriesWithCounts } from "@/lib/data";
import { CategoryCard } from "@/components/shared/category-card";

export async function CategoryTiles() {
  const categories = await getCategoriesWithCounts();
  if (!categories.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-12 md:px-8">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          {/* <p className="eyebrow text-muted-foreground">Browse the store</p> */}
          <h2 className="font-serif text-2xl text-foreground md:text-3xl">Collections</h2>
        </div>
        <Link href="/collections" className="inline-flex shrink-0 items-center gap-1 text-sm text-primary transition-colors hover:underline">
          All categories <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Uniform, equal-size tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {categories.map((c, i) => (
          <CategoryCard
            key={c.slug}
            slug={c.slug}
            name={c.name}
            count={c.count}
            image={c.image}
            index={i}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ))}
      </div>
    </section>
  );
}
