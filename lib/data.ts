/*
  Server-side data access. When MONGODB_URI is set, reads come from MongoDB and
  are mapped to the same shapes the storefront already uses. Otherwise it falls
  back to the static catalog so the site runs with no database. Every query is
  wrapped so a DB hiccup degrades to the catalog instead of crashing a page.

  Server-only: import from server components, route handlers, and actions.
*/

import {
  products as catalogProducts,
  categories as catalogCategories,
  reviews as catalogReviews,
  coupons as catalogCoupons,
  banners as catalogBanners,
  store as catalogStore,
  shops as catalogShops,
  getProductsByShop as catalogProductsByShop,
  type Product,
  type Category,
  type Review,
  type Coupon,
  type Banner,
  type Shop,
} from "@/lib/catalog";
import { isFlashActive, effectivePrice } from "@/lib/utils";
import type { SearchFilters } from "@/lib/catalog";

const hasDb = () => Boolean(process.env.MONGODB_URI);

/* ------------------------------------------------------------------ */
/*  Mappers: Mongo lean docs -> storefront shapes                      */
/* ------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Self-heal known-dead remote image URLs (e.g. Unsplash photos that were
// removed) without requiring a DB migration. Add entries as needed.
const DEAD_IMAGE_REPLACEMENTS: Record<string, string> = {
  "photo-1584100936595-c0654b55a2e6": "photo-1522771739844-6a9f6d5f14af", // woven cotton throw
  "photo-1602874801006-e26f4d6c2c0e": "photo-1603006905003-be475563bc59", // scented soy candle
};
function healImage(url: string): string {
  if (typeof url !== "string") return url;
  for (const [dead, repl] of Object.entries(DEAD_IMAGE_REPLACEMENTS)) {
    if (url.includes(dead)) return url.replace(dead, repl);
  }
  return url;
}

function mapProduct(d: any): Product {
  return {
    id: String(d._id),
    slug: d.slug,
    name: d.name,
    category: d.category, // stored as category slug
    shop: d.shop || undefined,
    brand: d.brand,
    description: d.description ?? "",
    price: d.price,
    listPrice: d.listPrice,
    images: (d.images ?? []).map(healImage),
    sizes: d.sizes ?? [],
    colors: d.colors ?? [],
    variantLabel: d.variantLabel || undefined,
    variants: (d.variants ?? []).map((v: any) => ({ label: v.label, price: typeof v.price === "number" ? v.price : undefined })),
    countInStock: d.countInStock ?? 0,
    numSales: d.numSales ?? 0,
    avgRating: d.avgRating ?? 0,
    numReviews: d.numReviews ?? 0,
    isFeatured: Boolean(d.isFeatured),
    flashSale: Boolean(d.flashSale),
    flashSalePrice: d.flashSalePrice,
    flashSaleEnd: d.flashSaleEnd ? new Date(d.flashSaleEnd).toISOString() : undefined,
    tags: d.tags ?? [],
    added: d.createdAt ? new Date(d.createdAt).getTime() : Date.now(),
  };
}

function mapBanner(d: any): Banner {
  return {
    id: String(d._id),
    title: d.title,
    subtitle: d.subtitle ?? "",
    image: d.image,
    link: d.link ?? "/search",
    cta: "Shop now",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ------------------------------------------------------------------ */
/*  Core loaders                                                       */
/* ------------------------------------------------------------------ */

export async function getProducts(): Promise<Product[]> {
  if (!hasDb()) return catalogProducts;
  try {
    const { Product } = await getModelsSafe();
    const docs = await Product.find({ isPublished: true }).lean();
    if (!docs.length) return catalogProducts;
    return docs.map(mapProduct);
  } catch {
    return catalogProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDb()) return catalogProducts.find((p) => p.slug === slug) ?? null;
  try {
    const { Product } = await getModelsSafe();
    const doc = await Product.findOne({ slug }).lean();
    return doc ? mapProduct(doc) : catalogProducts.find((p) => p.slug === slug) ?? null;
  } catch {
    return catalogProducts.find((p) => p.slug === slug) ?? null;
  }
}

export async function getBanners(): Promise<Banner[]> {
  if (!hasDb()) return catalogBanners;
  try {
    const { Banner } = await getModelsSafe();
    const docs = await Banner.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    return docs.length ? docs.map(mapBanner) : catalogBanners;
  } catch {
    return catalogBanners;
  }
}

export async function getReviewsForProductSlug(slug: string): Promise<Review[]> {
  if (!hasDb()) return catalogReviews.filter((r) => r.productSlug === slug);
  try {
    const { Product, Review } = await getModelsSafe();
    const product = await Product.findOne({ slug }).select("_id").lean();
    if (!product) return catalogReviews.filter((r) => r.productSlug === slug);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = await Review.find({ product: (product as any)._id, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return docs.map((d: any) => ({
      id: String(d._id),
      productSlug: slug,
      name: d.name,
      rating: d.rating,
      comment: d.comment ?? "",
      date: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch {
    return catalogReviews.filter((r) => r.productSlug === slug);
  }
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  const upper = code.trim().toUpperCase();
  if (!hasDb()) return catalogCoupons.find((c) => c.code === upper) ?? null;
  try {
    const { Coupon } = await getModelsSafe();
    const d = await Coupon.findOne({ code: upper, isActive: true }).lean();
    if (!d) return catalogCoupons.find((c) => c.code === upper) ?? null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = d as any;
    return {
      code: doc.code,
      type: doc.type,
      value: doc.value,
      minOrder: doc.minOrder ?? 0,
      description: doc.code,
    };
  } catch {
    return catalogCoupons.find((c) => c.code === upper) ?? null;
  }
}

/* ------------------------------------------------------------------ */
/*  Derived queries (operate on the active product source)            */
/* ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  if (process.env.MONGODB_URI) {
    try {
      const { Category } = await getModelsSafe();
      const docs = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
      if (docs.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (docs as any[]).map((c) => ({ slug: c.slug, name: c.name, blurb: c.blurb ?? "", image: c.image ?? "" }));
      }
    } catch { /* fall back to the static catalog */ }
  }
  return catalogCategories;
}

export async function getCategoriesWithCounts(): Promise<(Category & { count: number })[]> {
  const [cats, list] = await Promise.all([getCategories(), getProducts()]);
  return cats.map((c) => ({
    ...c,
    count: list.filter((p) => p.category === c.slug).length,
  }));
}

export async function getByCategory(slug: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.category === slug);
}

export async function featured(n = 14): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.isFeatured).slice(0, n);
}

export async function newArrivals(n = 14): Promise<Product[]> {
  return [...(await getProducts())].sort((a, b) => b.added - a.added).slice(0, n);
}

export async function trending(n = 14): Promise<Product[]> {
  return [...(await getProducts())].sort((a, b) => b.numSales - a.numSales).slice(0, n);
}

export async function flashDeals(): Promise<Product[]> {
  return (await getProducts()).filter((p) => isFlashActive(p));
}

export async function searchProducts(filters: SearchFilters): Promise<Product[]> {
  const { q, category, min, max, minRating, flashOnly, sort = "newest" } = filters;
  let list = await getProducts();

  if (q) {
    const term = q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.tags.some((t) => t.includes(term))
    );
  }
  if (category) list = list.filter((p) => p.category === category);
  if (typeof min === "number") list = list.filter((p) => effectivePrice(p) >= min);
  if (typeof max === "number") list = list.filter((p) => effectivePrice(p) <= max);
  if (typeof minRating === "number") list = list.filter((p) => p.avgRating >= minRating);
  if (flashOnly) list = list.filter((p) => isFlashActive(p));

  const arr = [...list];
  switch (sort) {
    case "price-asc": arr.sort((a, b) => effectivePrice(a) - effectivePrice(b)); break;
    case "price-desc": arr.sort((a, b) => effectivePrice(b) - effectivePrice(a)); break;
    case "rating": arr.sort((a, b) => b.avgRating - a.avgRating); break;
    case "best-selling": arr.sort((a, b) => b.numSales - a.numSales); break;
    default: arr.sort((a, b) => b.added - a.added);
  }
  return arr;
}

export async function suggest(q: string, n = 6): Promise<Product[]> {
  if (!q.trim()) return trending(n);
  return (await searchProducts({ q, sort: "best-selling" })).slice(0, n);
}

/* ------------------------------------------------------------------ */
/*  Lazy model loader (avoids importing mongoose unless DB is used)    */
/* ------------------------------------------------------------------ */

async function getModelsSafe() {
  const { getModels } = await import("@/lib/db/get-models");
  return getModels();
}

export type StoreSettings = {
  whatsapp?: string;
  instagram?: string;
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
};

export async function getSettings(): Promise<StoreSettings> {
  const fallback: StoreSettings = {
    storeName: catalogStore.name,
    supportPhone: catalogStore.supportPhone,
    supportEmail: catalogStore.supportEmail,
    address: catalogStore.address,
    whatsapp: undefined,
    instagram: undefined,
  };
  if (!process.env.MONGODB_URI) return fallback;
  try {
    const { Setting } = await getModelsSafe();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = await Setting.findOne({ key: "store" }).lean();
    if (!doc) return fallback;
    return {
      storeName: doc.storeName || fallback.storeName,
      supportPhone: doc.supportPhone || fallback.supportPhone,
      supportEmail: doc.supportEmail || fallback.supportEmail,
      address: doc.address || fallback.address,
      whatsapp: doc.whatsapp || fallback.whatsapp,
      instagram: doc.instagram || fallback.instagram,
    };
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/*  Shops (multivendor)                                                 */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapShop(d: any): Shop {
  return {
    slug: d.slug, name: d.name, blurb: d.blurb ?? "", logo: d.logo ?? "",
    headerColor: d.headerColor || "#c96442",
    bagFee: typeof d.bagFee === "number" ? d.bagFee : 0,
    discountPct: typeof d.discountPct === "number" ? d.discountPct : 0,
    deliveryFee: typeof d.deliveryFee === "number" ? d.deliveryFee : undefined,
  };
}

export async function getShops(): Promise<Shop[]> {
  if (process.env.MONGODB_URI) {
    try {
      const { Shop } = await getModelsSafe();
      const docs = await Shop.find({ isActive: true, isSuspended: { $ne: true } }).sort({ order: 1, name: 1 }).lean();
      if (docs.length) return (docs as any[]).map(mapShop);
    } catch { /* fall back */ }
  }
  return catalogShops;
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  if (process.env.MONGODB_URI) {
    try {
      const { Shop } = await getModelsSafe();
      const doc = await Shop.findOne({ slug }).lean();
      if (doc) return mapShop(doc);
    } catch { /* fall back */ }
  }
  return catalogShops.find((s) => s.slug === slug) ?? null;
}

export async function getShopsWithCounts(): Promise<(Shop & { count: number })[]> {
  const [list, products] = await Promise.all([getShops(), getProducts()]);
  return list.map((sh) => ({ ...sh, count: products.filter((p) => p.shop === sh.slug).length }));
}

export async function getProductsByShop(slug: string): Promise<Product[]> {
  if (process.env.MONGODB_URI) {
    try {
      const { Product } = await getModelsSafe();
      const docs = await Product.find({ shop: slug, isPublished: true }).sort({ createdAt: -1 }).lean();
      return (docs as any[]).map(mapProduct);
    } catch { /* fall back */ }
  }
  return catalogProductsByShop(slug);
}
