import Link from "next/link";
import { Store } from "lucide-react";
import { getShopsWithCounts } from "@/lib/data";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shops — NairobiComradeStore" };

export default async function ShopsPage() {
  const shops = await getShopsWithCounts();
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
      <h1 className="font-serif text-2xl text-foreground md:text-3xl">Shops</h1>
      <p className="mt-1 text-sm text-muted-foreground">Browse by vendor — each shop, its own world.</p>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shops.map((s) => (
          <Link key={s.slug} href={`/shop/${s.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-20" style={{ backgroundColor: s.headerColor }} />
            <div className="-mt-10 px-4 pb-4">
              <div className="size-16 overflow-hidden rounded-full border-2 border-card bg-secondary">
                {s.logo ? <ImageWithFallback src={s.logo} alt={s.name} wrapperClassName="h-full w-full" sizes="64px" /> : <span className="grid h-full w-full place-items-center text-muted-foreground"><Store className="size-6" /></span>}
              </div>
              <p className="mt-2 font-medium text-foreground group-hover:text-primary">{s.name}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{s.blurb}</p>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">{s.count} products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
