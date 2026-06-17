import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    "", "/search", "/collections", "/flash-sales", "/about", "/size-guide",
    "/legal/privacy-policy", "/legal/terms-of-service", "/legal/shipping-returns", "/legal/cookie-policy",
  ];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.6,
  }));

  let categoryList: { slug: string }[] = [];
  try { categoryList = await getCategories(); } catch { /* ignore */ }
  const categoryEntries: MetadataRoute.Sitemap = categoryList.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch { /* fall back to static + categories only */ }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
