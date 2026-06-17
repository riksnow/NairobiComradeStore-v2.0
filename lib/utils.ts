import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* ------------------------------------------------------------------ */
/*  Class names                                                        */
/* ------------------------------------------------------------------ */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/*  Money — Kenya Shillings, displayed as "Ksh 1,499"                  */
/* ------------------------------------------------------------------ */

export function formatKsh(n: number): string {
  const value = Number.isFinite(n) ? Math.round(n) : 0;
  return `Ksh ${value.toLocaleString("en-KE")}`;
}

/* ------------------------------------------------------------------ */
/*  Pricing helpers                                                    */
/* ------------------------------------------------------------------ */

type PriceLike = {
  price: number;
  listPrice?: number | null;
  flashSale?: boolean;
  flashSalePrice?: number | null;
  flashSaleEnd?: Date | string | null;
};

/** Is a flash sale currently live for this product? */
export function isFlashActive(p: PriceLike, now: Date = new Date()): boolean {
  if (!p.flashSale) return false;
  if (p.flashSalePrice == null) return false;
  if (!p.flashSaleEnd) return false;
  return new Date(p.flashSaleEnd).getTime() > now.getTime();
}

/** The price a customer actually pays right now. */
export function effectivePrice(p: PriceLike, now: Date = new Date()): number {
  if (isFlashActive(p, now)) return p.flashSalePrice as number;
  return p.price;
}

/**
 * Discount percentage to display, comparing the effective price against the
 * original. Prefers an active flash sale, else falls back to listPrice.
 * Returns 0 when there is no genuine discount.
 */
export function discountPercent(p: PriceLike, now: Date = new Date()): number {
  const current = effectivePrice(p, now);
  const original = isFlashActive(p, now) ? p.price : p.listPrice ?? 0;
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

/* ------------------------------------------------------------------ */
/*  Strings & dates                                                    */
/* ------------------------------------------------------------------ */

export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-KE", opts).format(d);
}

/* ------------------------------------------------------------------ */
/*  Serialization — Mongoose lean doc → plain JSON-safe object         */
/* ------------------------------------------------------------------ */

/**
 * Converts a Mongoose document (or any value containing ObjectIds / Dates)
 * into a plain, serializable object safe to hand to client components or
 * return as JSON. ObjectIds become strings and Dates become ISO strings.
 */
export function serialize<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
