import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { banners } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export function Hero() {
  const banner = banners[0];
  if (!banner) return null;
  return (
    <section className="relative overflow-hidden">
      <div className="aspect-[16/10] w-full sm:aspect-[21/9] lg:aspect-[24/8]">
        <ImageWithFallback src={banner.image} alt={banner.title} priority wrapperClassName="h-full w-full" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(61,57,41,0.62) 0%, rgba(61,57,41,0.25) 55%, transparent 100%)" }}
      />
      <div className="absolute inset-0 mx-auto flex max-w-[1500px] flex-col justify-center px-6 md:px-10">
        <div className="max-w-xl">
          <h1 className="font-serif font-light leading-[1.05] text-background" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
            {banner.title}
          </h1>
          <p className="mt-4 max-w-md text-base text-background/85 md:text-lg">{banner.subtitle}</p>
          <Button asChild size="lg" className="mt-7">
            <Link href={banner.link}>{banner.cta}<ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
