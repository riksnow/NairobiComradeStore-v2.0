import Link from "next/link";
import { Store, ArrowRight } from "lucide-react";
import type { Shop } from "@/lib/catalog";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export function ShopsStrip({ shops }: { shops: Shop[] }) {
  if (!shops.length) return null;

  // Repeat the list enough times that one "half" comfortably exceeds the widest
  // screen, then duplicate that half so translateX(-50%) loops seamlessly.
  const REPEAT = Math.max(4, Math.ceil(28 / shops.length));
  const half = Array.from({ length: REPEAT }, () => shops).flat();
  const loop = [...half, ...half];
  const durationS = half.length * 3.2; // consistent px/sec regardless of count

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          {/* <p className="eyebrow text-muted-foreground">Multivendor</p> */}
          <h2 className="font-serif text-2xl text-foreground md:text-3xl">Shops</h2>
        </div>
        <Link href="/shops" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          All shops <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="ncs-marquee group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <ul
          className="ncs-marquee-track flex w-max items-start py-2 group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${durationS}s` }}
        >
          {loop.map((s, i) => (
            <li key={s.slug + i} className="mr-7 w-24 shrink-0">
              <Link href={`/shop/${s.slug}`} className="flex flex-col items-center gap-2 text-center">
                <span
                  className="grid size-20 place-items-center rounded-full p-[3px] transition-transform duration-300 hover:scale-105"
                  style={{ background: `conic-gradient(${s.headerColor}, ${s.headerColor}55, ${s.headerColor})` }}
                >
                  <span className="size-full overflow-hidden rounded-full border-2 border-background bg-secondary">
                    {s.logo
                      ? <ImageWithFallback src={s.logo} alt={s.name} wrapperClassName="h-full w-full" sizes="80px" />
                      : <span className="grid h-full w-full place-items-center text-muted-foreground"><Store className="size-7" /></span>}
                  </span>
                </span>
                <span className="line-clamp-1 text-xs font-medium text-foreground">{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes ncs-marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ncs-marquee-track { animation-name: ncs-marquee-scroll; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .ncs-marquee-track { animation: none; } }
      `}</style>
    </section>
  );
}
