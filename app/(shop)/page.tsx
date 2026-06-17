import { Hero } from "@/components/home/hero";
import { CategoryTiles } from "@/components/home/category-tiles";
import { ProductSection } from "@/components/home/product-section";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { flashDeals, newArrivals, trending, featured } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [flash, arrivals, trend, feat] = await Promise.all([
    flashDeals(), newArrivals(), trending(), featured(),
  ]);
  return (
    <>
      <Hero />
      <CategoryTiles />

      {flash.length > 0 && (
        <ProductSection
          title="Flash deals"
          products={flash.slice(0, 14)}
          href="/flash-sales"
          accent
        />
      )}

      <ProductSection
        title="New arrivals"
        products={arrivals.slice(0, 14)}
        href="/search?sort=newest"
      />
      <ProductSection
        title="Trending now"
        products={trend.slice(0, 14)}
        href="/search?sort=best-selling"
      />
      <ProductSection
        title="Featured picks"
        products={feat.slice(0, 14)}
        href="/collections"
      />

      {/* Subscribe */}
      <section className="mx-auto max-w-[1500px] px-4 pb-16 pt-6 md:px-8">
        <div className="rounded-2xl border border-border bg-secondary/40 px-6 py-10 text-center md:px-12">
          <p className="eyebrow text-muted-foreground">Stay in the loop</p>
          <h2 className="mt-2 font-serif text-2xl text-foreground md:text-3xl">
            Deals, drops & restocks — first.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Join the comrade list. No spam, just the good stuff.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
