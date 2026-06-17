import Link from "next/link";
import { getCategoriesWithCounts } from "@/lib/data";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export const metadata = { title: "Collections — NairobiComradeStore" };

export default async function CollectionsPage() {
  const categories = await getCategoriesWithCounts();
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
      <h1 className="font-serif text-2xl text-foreground md:text-3xl">Shop by category</h1>
      <p className="mt-1 text-sm text-muted-foreground">All departments, delivered across Nairobi.</p>

      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group relative overflow-hidden rounded-xl border border-border"
          >
            <ImageWithFallback
              src={c.image}
              alt={c.name}
              wrapperClassName="aspect-[4/3]"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <h2 className="font-serif text-lg text-background md:text-xl">{c.name}</h2>
              <p className="text-xs text-background/80">{c.count} items</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
