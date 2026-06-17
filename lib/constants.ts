/* ------------------------------------------------------------------ */
/*  Order & payment                                                    */
/* ------------------------------------------------------------------ */

export const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Forward-only flow; Cancelled is reachable from any non-final state. */
export const FORWARD_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return FORWARD_TRANSITIONS[from]?.includes(to) ?? false;
}

export const PAYMENT_METHODS = ["M-Pesa", "Cash on Delivery"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const USER_ROLES = ["Customer", "Admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/* ------------------------------------------------------------------ */
/*  Delivery                                                           */
/* ------------------------------------------------------------------ */

export const FREE_DELIVERY_THRESHOLD = Infinity; // no free-delivery offer
export const NAIROBI_DELIVERY_FEE = 250; // Ksh, flat delivery fee

export function deliveryFeeFor(subtotal: number): number {
  return subtotal > 0 ? NAIROBI_DELIVERY_FEE : 0;
}

/* ------------------------------------------------------------------ */
/*  Catalogue                                                          */
/* ------------------------------------------------------------------ */

export const KNOWN_CATEGORIES = [
  "Fashion",
  "Shoes",
  "Electronics",
  "Home & Living",
  "Beauty",
  "Sports",
] as const;
export type KnownCategory = (typeof KNOWN_CATEGORIES)[number];

/**
 * Category-aware variant presets surfaced as one-tap chips in the admin
 * product form. Custom values are always still allowed.
 */
export const VARIANT_PRESETS: Record<string, { sizes: string[]; colors: string[] }> = {
  Shoes: {
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    colors: ["Black", "White", "Brown", "Navy", "Tan"],
  },
  Fashion: {
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Grey", "Beige", "Olive", "Maroon"],
  },
  Electronics: {
    sizes: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    colors: ["Black", "Silver", "Space Grey", "Blue", "Gold"],
  },
  Beauty: {
    sizes: ["30ml", "50ml", "100ml", "200ml"],
    colors: ["Natural", "Warm", "Cool"],
  },
  Sports: {
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Red", "Blue", "Green", "Yellow"],
  },
  "Home & Living": {
    sizes: ["Small", "Medium", "Large"],
    colors: ["Natural", "White", "Charcoal", "Terracotta", "Sage"],
  },
};

export const DEFAULT_CITY = "Nairobi";

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

export const NOTIFICATION_TYPES = [
  "order",
  "review",
  "system",
  "promotion",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/* ------------------------------------------------------------------ */
/*  Coupons                                                            */
/* ------------------------------------------------------------------ */

export const COUPON_TYPES = ["percentage", "fixed"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

/** Public site origin — used for SEO (sitemap, canonical URLs, Open Graph). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nairobicomradestore.co.ke").replace(/\/$/, "");
