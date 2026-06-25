import { getCategoriesWithCounts } from "@/lib/data";
import { CategoryCard } from "@/components/shared/category-card";

export const metadata = { title: "Collections — NairobiComradeStore" };

export default async function CollectionsPage() {
  const categories = await getCategoriesWithCounts();
  const total = categories.reduce((n, c) => n + c.count, 0);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div>
          {/* <p className="eyebrow text-muted-foreground">Collections</p> */}
          <h1 className="mt-1 font-serif text-3xl text-foreground md:text-4xl">Collections</h1>
        </div>
        <p className="text-sm text-muted-foreground">{categories.length} collections · {total} products</p>
      </div>

      {/* Smaller, denser tiles on large screens */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((c, i) => (
          <CategoryCard
            key={c.slug}
            slug={c.slug}
            name={c.name}
            count={c.count}
            image={c.image}
            index={i}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ))}
      </div>
    </div>
  );
}
