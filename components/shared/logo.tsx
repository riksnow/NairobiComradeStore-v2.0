import Link from "next/link";
import { cn } from "@/lib/utils";

/** The site wordmark, reused in header, footer, auth pages and the favicon. */
export function Logo({
  className,
  href = "/",
  onClick,
}: {
  className?: string;
  href?: string | null;
  onClick?: () => void;
}) {
  const mark = (
    <span className={cn("inline-flex items-baseline font-serif leading-none tracking-tight", className)}>
      <span className="text-foreground">Nairobi</span>
      <span className="text-primary">Comrade</span>
      <span className="text-foreground">Store</span>
    </span>
  );
  if (href === null) return mark;
  return (
    <Link href={href} onClick={onClick} aria-label="NairobiComradeStore home">
      {mark}
    </Link>
  );
}
