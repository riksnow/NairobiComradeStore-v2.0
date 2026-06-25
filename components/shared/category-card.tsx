import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";
import { cn } from "@/lib/utils";

/** Uniform, modern category tile (portrait). Used on the homepage and /collections. */
export function CategoryCard({
  slug, name, count, image, index, sizes, className,
}: {
  slug: string;
  name: string;
  count: number;
  image: string;
  index?: number;
  sizes?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/category/${slug}`}
      className={cn(
        "group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-secondary",
        className
      )}
    >
      <ImageWithFallback
        src={image}
        alt={name}
        wrapperClassName="absolute inset-0 h-full w-full"
        className="transition-transform duration-[800ms] ease-out group-hover:scale-110"
        sizes={sizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw"}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-foreground/5 transition-colors duration-300 group-hover:from-foreground/90" />

      {typeof index === "number" && (
        <span className="absolute left-3.5 top-3 font-serif text-sm tabular-nums text-background/70">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 md:p-4">
        <div className="min-w-0">
          <p className="eyebrow text-[0.55rem] text-background/70">{count} {count === 1 ? "item" : "items"}</p>
          <h3 className="mt-0.5 font-serif text-base leading-tight text-background md:text-lg">{name}</h3>
          <span className="mt-1.5 hidden items-center gap-1.5 text-[0.7rem] font-medium text-background/90 sm:inline-flex">
            Shop now
            <span aria-hidden className="h-px w-3.5 bg-background/70 transition-all duration-300 ease-out group-hover:w-6" />
          </span>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-background/45 text-background transition-all duration-300 ease-out group-hover:border-background group-hover:bg-background group-hover:text-foreground md:size-9">
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}
