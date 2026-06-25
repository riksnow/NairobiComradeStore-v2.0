import Link from "next/link";
import { cn } from "@/lib/utils";

/** The NCS mark: an orange dome holding the Nairobi skyline (with the iconic
 *  KICC tower) above a shopping cart — drawn as crisp, themeable SVG. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 104 116" className={className} role="img" aria-label="Nairobi Comrade Store">
      {/* Orange dome (sun rising over the city) */}
      <path d="M2 60 A50 50 0 0 1 102 60 Z" fill="var(--primary)" />

      {/* Nairobi skyline — negative space in the page colour */}
      <g fill="var(--background)">
        <rect x="15" y="46" width="7" height="14" rx="0.5" />
        <rect x="23" y="40" width="6" height="20" rx="0.5" />
        <rect x="30" y="45" width="5" height="15" rx="0.5" />
        {/* KICC: cylindrical tower + saucer + antenna */}
        <rect x="46" y="25" width="9" height="35" rx="1" />
        <ellipse cx="50.5" cy="25" rx="7" ry="2.6" />
        <rect x="49.7" y="14" width="1.6" height="11" rx="0.8" />
        <rect x="58" y="38" width="7" height="22" rx="0.5" />
        <rect x="66" y="43" width="6" height="17" rx="0.5" />
        <rect x="73" y="34" width="5" height="26" rx="0.5" />
        <rect x="79" y="47" width="7" height="13" rx="0.5" />
      </g>

      {/* Shopping cart */}
      <g transform="translate(30 64) scale(1.78)" fill="none" stroke="var(--foreground)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1.4" />
        <circle cx="18.5" cy="21" r="1.4" />
        <path d="M1.5 1.5h2.2l2.66 12.42a2 2 0 0 0 2 1.58h9.4a2 2 0 0 0 1.95-1.57l1.6-7.43H5" />
      </g>
    </svg>
  );
}

/** The site wordmark + mark, reused in header, footer, auth pages and admin. */
export function Logo({
  className,
  href = "/",
  onClick,
  showMark = true,
}: {
  className?: string;
  href?: string | null;
  onClick?: () => void;
  showMark?: boolean;
}) {
  const mark = (
    <span className={cn("inline-flex items-center gap-1.5 font-serif leading-none tracking-tight", className)}>
      {showMark && <LogoMark className="h-[1.5em] w-auto shrink-0" />}
      <span className="inline-flex items-baseline">
        <span className="text-foreground">Nairobi</span>
        <span className="text-primary">Comrade</span>
        <span className="text-foreground">Store</span>
      </span>
    </span>
  );
  if (href === null) return mark;
  return (
    <Link href={href} onClick={onClick} aria-label="Nairobi Comrade Store home">
      {mark}
    </Link>
  );
}
