"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** wrapper class — set sizing/aspect here */
  wrapperClassName?: string;
  priority?: boolean;
};

/**
 * Renders a real photograph. If the source fails to load, it swaps to an
 * elegant warm gradient (in Claude-Theme tones) with the alt label — so the
 * layout never shows a broken-image icon and always stays on-brand.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  wrapperClassName,
  priority,
}: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", wrapperClassName)}>
      {failed ? (
        <div
          className="flex h-full w-full items-end p-6"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--secondary) 0%, var(--accent) 60%, var(--muted) 100%)",
          }}
        >
          <span className="eyebrow text-[0.65rem] text-muted-foreground">
            {alt}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", className)}
        />
      )}
    </div>
  );
}
