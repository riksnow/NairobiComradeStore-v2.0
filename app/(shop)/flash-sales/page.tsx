import { Zap } from "lucide-react";
import { flashDeals } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata = { title: "Flash sales — NairobiComradeStore" };

export default function FlashSalesPage() {
  const deals = flashDeals();
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-primary/12 text-primary">
          <Zap className="size-5" />
        </span>
        <div>
          <h1 className="font-serif text-2xl text-primary md:text-3xl">Flash sales</h1>
          <p className="text-sm text-muted-foreground">Limited-time prices — while stock lasts.</p>
        </div>
      </div>

      <div className="mt-7">
        {deals.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No flash sales running right now. Check back soon.
          </p>
        ) : (
          <ProductGrid products={deals} />
        )}
      </div>
    </div>
  );
}
