"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

export type HeroButton = { label: string; href: string; variant?: "solid" | "outline" };
export type HeroSlide = {
  id: string;
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  tint?: string;
  buttons: HeroButton[];
};

const ROTATE_MS = 2600; // fast rotation so users see many banners quickly

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setI((c) => (c + 1) % n), ROTATE_MS);
    return () => clearInterval(t);
  }, [n, paused]);

  if (!n) return null;
  const go = (d: number) => setI((c) => (c + d + n) % n);
  const s = slides[i];
  const align = s.align ?? "left";
  const alignWrap =
    align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";
  const tint = s.tint ?? "#3d3929";
  const gradient =
    align === "center"
      ? `linear-gradient(0deg, ${tint}cc, ${tint}40 55%, ${tint}66)`
      : align === "right"
      ? `linear-gradient(270deg, ${tint}d9 0%, ${tint}40 55%, transparent 100%)`
      : `linear-gradient(90deg, ${tint}d9 0%, ${tint}40 55%, transparent 100%)`;

  return (
    <section className="relative isolate z-0 w-full">
      <div
        className="relative h-[clamp(180px,30vh,300px)] w-full overflow-hidden border-b border-border sm:h-[clamp(300px,48vh,560px)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <ImageWithFallback src={s.image} alt={s.title} priority wrapperClassName="h-full w-full" sizes="(max-width: 768px) 100vw, 1400px" quality={92} />
            <div aria-hidden className="absolute inset-0" style={{ background: gradient }} />
          </motion.div>
        </AnimatePresence>

        {/* Per-slide content — each banner has its own buttons & alignment */}
        <div className={`absolute inset-0 flex flex-col justify-center ${alignWrap}`}>
          <div className={`mx-auto flex w-full max-w-[1500px] flex-col px-6 md:px-8 ${align === "center" ? "items-center" : align === "right" ? "items-end" : "items-start"}`}>
          <motion.div
            key={`c-${s.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="max-w-lg"
          >
            {s.eyebrow && <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.18em] text-background/85">{s.eyebrow}</p>}
            <h1 className="font-serif font-light leading-[1.04] text-background" style={{ fontSize: "clamp(1.7rem, 4.2vw, 3.4rem)" }}>{s.title}</h1>
            {s.subtitle && <p className="mt-2 max-w-md text-sm text-background/85 md:text-base">{s.subtitle}</p>}
            <div className={`mt-5 flex flex-wrap gap-2.5 ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : ""}`}>
              {s.buttons.map((b) => (
                <Link
                  key={b.href + b.label}
                  href={b.href}
                  className={
                    b.variant === "outline"
                      ? "inline-flex items-center gap-1.5 rounded-full border border-background/70 px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-background/15"
                      : "inline-flex items-center gap-1.5 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-transform hover:scale-[1.03]"
                  }
                >
                  {b.label} <ArrowRight className="size-4" />
                </Link>
              ))}
            </div>
          </motion.div>
          </div>
        </div>

        {n > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-3 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full bg-background/70 p-2 text-foreground backdrop-blur hover:bg-background sm:grid"><ChevronLeft className="size-5" /></button>
            <button onClick={() => go(1)} aria-label="Next" className="absolute right-3 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full bg-background/70 p-2 text-foreground backdrop-blur hover:bg-background sm:grid"><ChevronRight className="size-5" /></button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slides.map((_, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? "w-7 bg-background" : "w-1.5 bg-background/50"}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
