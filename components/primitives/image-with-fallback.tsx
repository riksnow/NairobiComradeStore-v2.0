"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** wrapper class — set sizing/aspect here */
  wrapperClassName?: string;
  priority?: boolean;
  /** Responsive sizing hint for the optimizer (defaults to a generous, sharp value). */
  sizes?: string;
  /** JPEG/WebP quality the optimizer targets (default 90 — near source quality). */
  quality?: number;
};

/**
 * Renders a real photograph at high quality.
 *
 * 1. First tries Next.js's image optimizer (`next/image`): it serves a
 *    correctly-sized, retina-aware, modern-format (WebP/AVIF) image — much
 *    sharper than a raw <img> on high-DPI screens.
 * 2. If the optimizer can't fetch the host, it falls back to a raw <img>
 *    (full native resolution, no referrer so hot-link-protected hosts work).
 * 3. If even that fails, it shows an on-brand warm gradient with the label.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  wrapperClassName,
  priority,
  sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw",
  quality = 90,
}: Props) {
  // Decide how to render a given src:
  //  - http(s) URL  -> Next optimizer
  //  - data:/blob:  -> raw <img> (the optimizer can't fetch these)
  //  - empty/malformed -> gradient placeholder (avoids ERR_INVALID_URL)
  const classify = (s: string): "optimized" | "raw" | "failed" => {
    if (!s || typeof s !== "string") return "failed";
    if (s.startsWith("data:")) return s.includes(",") && s.length > 24 ? "raw" : "failed";
    if (s.startsWith("blob:")) return "raw";
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) return "optimized";
    return "failed";
  };

  const [stage, setStage] = useState<"optimized" | "raw" | "failed">(() => classify(src));

  // Reset when the source changes (e.g. gallery thumbnails).
  useEffect(() => { setStage(classify(src)); }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", wrapperClassName)}>
      {stage === "failed" ? (
        <div
          className="flex h-full w-full items-end p-6"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--secondary) 0%, var(--accent) 60%, var(--muted) 100%)",
          }}
        >
          <span className="eyebrow text-[0.65rem] text-muted-foreground">{alt}</span>
        </div>
      ) : stage === "optimized" ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          onError={() => setStage("raw")}
          className={cn("object-cover", className)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setStage("failed")}
          className={cn("absolute inset-0 h-full w-full object-cover", className)}
        />
      )}
    </div>
  );
}
