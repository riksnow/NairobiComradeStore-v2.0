/*
  The whole storefront reads from this module so the base product runs with no
  database. When the backend milestones land, these helpers get swapped for
  getModels() queries returning the same DTO shapes.
*/

import { isFlashActive } from "@/lib/utils";

export const store = {
  name: "NairobiComradeStore",
  shortName: "NCS",
  tagline: "Real deals for the Nairobi comrade.",
  supportPhone: "+254 700 000 000",
  supportEmail: "support@nairobicomradestore.co.ke",
  address: "Moi Avenue, Nairobi CBD",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Category = {
  slug: string;
  name: string;
  image: string;
  blurb: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string; // category slug
  shop?: string; // shop slug
  brand?: string;
  description: string;
  price: number; // Ksh
  listPrice?: number; // original, for discount display
  images: string[];
  sizes: string[];
  colors: string[];
  variantLabel?: string;
  variants?: { label: string; price?: number }[];
  countInStock: number;
  numSales: number;
  avgRating: number;
  numReviews: number;
  isFeatured: boolean;
  flashSale: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: string; // ISO
  tags: string[];
  added: number; // higher = newer (for "new arrivals")
};

export type Review = {
  id: string;
  productSlug: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  cta: string;
};

export type Coupon = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  description: string;
};

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

export const categories: Category[] = [
  { slug: "fashion", name: "Fashion", blurb: "Everyday fits & statement pieces",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" },
  { slug: "shoes", name: "Shoes", blurb: "Sneakers, official & boots",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80" },
  { slug: "electronics", name: "Electronics", blurb: "Phones, audio & accessories",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80" },
  { slug: "home-living", name: "Home & Living", blurb: "Make the place yours",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80" },
  { slug: "beauty", name: "Beauty", blurb: "Skin, scent & self-care",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80" },
  { slug: "sports", name: "Sports", blurb: "Train, ball & recover",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80" },
];

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// flash end ~3 days out from a fixed base so it stays "active" for demos
const soon = new Date(Date.now() + 3 * 864e5).toISOString();

export const products: Product[] = [
  // ── Fashion ───────────────────────────────────────────────
  { id: "f1", slug: "comrade-oversized-tee", name: "Comrade Oversized Tee", category: "fashion", brand: "NCS Basics",
    description: "Heavyweight 240gsm cotton tee with a relaxed, boxy fit. The everyday staple that survives every wash.",
    price: 1299, listPrice: 1799, images: [u("1521572163474-6864f9cf17ab"), u("1583743814966-8936f37f4678")],
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Olive"], countInStock: 40, numSales: 210,
    avgRating: 4.6, numReviews: 38, isFeatured: true, flashSale: false, tags: ["new", "cotton"], added: 30 },
  { id: "f2", slug: "denim-trucker-jacket", name: "Denim Trucker Jacket", category: "fashion", brand: "Riverside",
    description: "Rigid mid-blue denim jacket with a classic trucker cut. Wears in beautifully over time.",
    price: 3499, listPrice: 4500, images: [u("1551028719-00167b16eac5"), u("1576995853123-5a10305d93c0")],
    sizes: ["S", "M", "L", "XL"], colors: ["Mid Blue", "Black"], countInStock: 18, numSales: 95,
    avgRating: 4.4, numReviews: 17, isFeatured: false, flashSale: false, tags: ["denim"], added: 22 },
  { id: "f3", slug: "ankara-print-shirt", name: "Ankara Print Shirt", category: "fashion", brand: "Soko",
    description: "Short-sleeve camp-collar shirt in a bold Ankara print. Locally inspired, made to stand out.",
    price: 2199, images: [u("1602810318383-e386cc2a3ccf"), u("1596755094514-f87e34085b2c")],
    sizes: ["S", "M", "L", "XL"], colors: ["Indigo", "Rust"], countInStock: 3, numSales: 60,
    avgRating: 4.8, numReviews: 12, isFeatured: true, flashSale: false, tags: ["local"], added: 28 },
  { id: "f4", slug: "fleece-hoodie", name: "Brushed Fleece Hoodie", category: "fashion", brand: "NCS Basics",
    description: "Cosy brushed-back fleece hoodie with a double-lined hood and kangaroo pocket.",
    price: 2499, listPrice: 3200, images: [u("1556821840-3a63f95609a7"), u("1620799140408-edc6dcb6d633")],
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Grey", "Black", "Maroon"], countInStock: 25, numSales: 150,
    avgRating: 4.5, numReviews: 22, isFeatured: false, flashSale: true, flashSalePrice: 1999, flashSaleEnd: soon, tags: ["sale"], added: 18 },
  { id: "f5", slug: "cargo-trousers", name: "Utility Cargo Trousers", category: "fashion", brand: "Riverside",
    description: "Tapered cargo trousers with six pockets and a drawcord hem.",
    price: 2899, images: [u("1517445312882-bc9910d016b7"), u("1624378439575-d8705ad7ae80")],
    sizes: ["28", "30", "32", "34", "36"], colors: ["Khaki", "Black"], countInStock: 0, numSales: 80,
    avgRating: 4.2, numReviews: 9, isFeatured: false, flashSale: false, tags: [], added: 12 },
  { id: "f6", slug: "linen-summer-dress", name: "Linen Summer Dress", category: "fashion", brand: "Soko",
    description: "Breezy midi dress in washed linen with adjustable straps.",
    price: 3299, listPrice: 3999, images: [u("1572804013309-59a88b7e92f1"), u("1583846783214-7229a91b20ed")],
    sizes: ["XS", "S", "M", "L"], colors: ["Sand", "Sage"], countInStock: 14, numSales: 70,
    avgRating: 4.7, numReviews: 15, isFeatured: true, flashSale: false, tags: ["linen"], added: 26 },

  // ── Shoes ─────────────────────────────────────────────────
  { id: "s1", slug: "street-runner-sneakers", name: "Street Runner Sneakers", category: "shoes", brand: "Pace",
    description: "Lightweight everyday runners with a cushioned midsole and breathable knit upper.",
    price: 4499, listPrice: 5999, images: [u("1542291026-7eec264c27ff"), u("1606107557195-0e29a4b5b4aa")],
    sizes: ["39", "40", "41", "42", "43", "44"], colors: ["White", "Black", "Navy"], countInStock: 30, numSales: 320,
    avgRating: 4.6, numReviews: 54, isFeatured: true, flashSale: true, flashSalePrice: 3799, flashSaleEnd: soon, tags: ["bestseller"], added: 29 },
  { id: "s2", slug: "leather-derby-shoes", name: "Leather Derby Shoes", category: "shoes", brand: "Bramwell",
    description: "Polished genuine-leather derby shoes for the office and beyond.",
    price: 5999, images: [u("1614252369475-531eba835eb1"), u("1449505278894-297fdb3edbc1")],
    sizes: ["40", "41", "42", "43", "44", "45"], colors: ["Black", "Brown"], countInStock: 12, numSales: 60,
    avgRating: 4.5, numReviews: 11, isFeatured: false, flashSale: false, tags: ["official"], added: 16 },
  { id: "s3", slug: "canvas-low-tops", name: "Canvas Low Tops", category: "shoes", brand: "Pace",
    description: "Simple canvas low-tops that go with everything. Vulcanised rubber sole.",
    price: 2299, listPrice: 2999, images: [u("1525966222134-fcfa99b8ae77"), u("1463100099107-aa0980c362e6")],
    sizes: ["38", "39", "40", "41", "42", "43"], colors: ["White", "Red", "Black"], countInStock: 4, numSales: 140,
    avgRating: 4.3, numReviews: 28, isFeatured: false, flashSale: false, tags: [], added: 14 },
  { id: "s4", slug: "trail-hiking-boots", name: "Trail Hiking Boots", category: "shoes", brand: "Summit",
    description: "Grippy, water-resistant hiking boots built for Ngong and beyond.",
    price: 6499, listPrice: 7999, images: [u("1520639888713-7851133b1ed0"), u("1542840410-3092f99611a3")],
    sizes: ["40", "41", "42", "43", "44"], colors: ["Brown", "Charcoal"], countInStock: 9, numSales: 40,
    avgRating: 4.8, numReviews: 8, isFeatured: true, flashSale: false, tags: ["outdoor"], added: 20 },

  // ── Electronics ───────────────────────────────────────────
  { id: "e1", slug: "wireless-anc-headphones", name: "Wireless ANC Headphones", category: "electronics", brand: "Aukey",
    description: "Over-ear Bluetooth headphones with active noise cancellation and 40-hour battery.",
    price: 7999, listPrice: 11999, images: [u("1505740420928-5e560c06d30e"), u("1583394838336-acd977736f90")],
    sizes: [], colors: ["Black", "Silver"], countInStock: 22, numSales: 260,
    avgRating: 4.7, numReviews: 61, isFeatured: true, flashSale: true, flashSalePrice: 6499, flashSaleEnd: soon, tags: ["bestseller"], added: 27 },
  { id: "e2", slug: "true-wireless-earbuds", name: "True Wireless Earbuds", category: "electronics", brand: "Aukey",
    description: "Compact TWS earbuds with a charging case and touch controls.",
    price: 3499, listPrice: 4999, images: [u("1590658268037-6bf12165a8df"), u("1572569511254-d8f925fe2cbb")],
    sizes: [], colors: ["White", "Black"], countInStock: 35, numSales: 300,
    avgRating: 4.4, numReviews: 47, isFeatured: false, flashSale: false, tags: [], added: 24 },
  { id: "e3", slug: "20000mah-power-bank", name: "20,000mAh Power Bank", category: "electronics", brand: "Oraimo",
    description: "Fast-charging power bank with dual USB-C, enough for several full phone charges.",
    price: 2999, images: [u("1609091839311-d5365f9ff1c5"), u("1583863788434-e58a36330cf0")],
    sizes: ["10000mAh", "20000mAh"], colors: ["Black"], countInStock: 50, numSales: 410,
    avgRating: 4.5, numReviews: 73, isFeatured: true, flashSale: false, tags: ["bestseller"], added: 19 },
  { id: "e4", slug: "1080p-webcam", name: "1080p Streaming Webcam", category: "electronics", brand: "Logi",
    description: "Full-HD webcam with autofocus and a built-in mic — great for class and calls.",
    price: 4299, listPrice: 5500, images: [u("1587825140708-dfaf72ae4b04"), u("1588872657578-7efd1f1555ed")],
    sizes: [], colors: ["Black"], countInStock: 2, numSales: 55,
    avgRating: 4.2, numReviews: 10, isFeatured: false, flashSale: false, tags: ["low-stock"], added: 13 },
  { id: "e5", slug: "mechanical-keyboard", name: "Compact Mechanical Keyboard", category: "electronics", brand: "Royal Kludge",
    description: "65% hot-swappable mechanical keyboard with tactile switches and RGB.",
    price: 5499, images: [u("1587829741301-dc798b83add3"), u("1618384887929-16ec33fab9ef")],
    sizes: [], colors: ["Black", "White"], countInStock: 16, numSales: 120,
    avgRating: 4.8, numReviews: 33, isFeatured: false, flashSale: false, tags: [], added: 21 },
  { id: "e6", slug: "smart-fitness-watch", name: "Smart Fitness Watch", category: "electronics", brand: "Amazfit",
    description: "AMOLED smartwatch with heart-rate, SpO2, GPS and a 10-day battery.",
    price: 8999, listPrice: 12000, images: [u("1546868871-7041f2a55e12"), u("1579586337278-3befd40fd17a")],
    sizes: [], colors: ["Black", "Rose"], countInStock: 0, numSales: 90,
    avgRating: 4.6, numReviews: 19, isFeatured: true, flashSale: false, tags: [], added: 25 },

  // ── Home & Living ─────────────────────────────────────────
  { id: "h1", slug: "scented-soy-candle", name: "Scented Soy Candle", category: "home-living", brand: "Mela",
    description: "Hand-poured soy candle with notes of cedar and vanilla. 45-hour burn.",
    price: 1299, images: [u("1603006905003-be475563bc59")],
    sizes: ["Small", "Large"], colors: ["Natural"], countInStock: 60, numSales: 130,
    avgRating: 4.5, numReviews: 24, isFeatured: false, flashSale: false, tags: [], added: 11 },
  { id: "h2", slug: "ceramic-mug-set", name: "Ceramic Mug Set of 4", category: "home-living", brand: "Clay & Co",
    description: "Stoneware mugs in warm earth tones — microwave and dishwasher safe.",
    price: 1899, listPrice: 2400, images: [u("1514228742587-6b1558fcca3d"), u("1578749556568-bc2c40e68b61")],
    sizes: [], colors: ["Terracotta", "Sage", "Charcoal"], countInStock: 28, numSales: 100,
    avgRating: 4.7, numReviews: 18, isFeatured: true, flashSale: false, tags: [], added: 17 },
  { id: "h3", slug: "cotton-throw-blanket", name: "Woven Cotton Throw", category: "home-living", brand: "Maua",
    description: "Chunky woven cotton throw with tasselled edges for the sofa or bed.",
    price: 2799, listPrice: 3500, images: [u("1522771739844-6a9f6d5f14af")],
    sizes: [], colors: ["Cream", "Mustard", "Slate"], countInStock: 15, numSales: 70,
    avgRating: 4.6, numReviews: 13, isFeatured: false, flashSale: true, flashSalePrice: 2199, flashSaleEnd: soon, tags: ["sale"], added: 23 },
  { id: "h4", slug: "rattan-pendant-lamp", name: "Rattan Pendant Lamp", category: "home-living", brand: "Maua",
    description: "Hand-woven rattan pendant shade that throws a warm, patterned glow.",
    price: 3999, images: [u("1513506003901-1e6a229e2d15"), u("1565814329452-e1efb11f3e89")],
    sizes: ["Medium", "Large"], colors: ["Natural"], countInStock: 7, numSales: 35,
    avgRating: 4.8, numReviews: 6, isFeatured: true, flashSale: false, tags: [], added: 15 },

  // ── Beauty ────────────────────────────────────────────────
  { id: "b1", slug: "shea-body-butter", name: "Raw Shea Body Butter", category: "beauty", brand: "Pure Africa",
    description: "Unrefined shea butter whipped with marula oil for deep, everyday moisture.",
    price: 999, listPrice: 1400, images: [u("1556228578-8c89e6adf883"), u("1571781926291-c477ebfd024b")],
    sizes: ["100ml", "200ml"], colors: ["Natural"], countInStock: 80, numSales: 220,
    avgRating: 4.8, numReviews: 41, isFeatured: true, flashSale: false, tags: ["bestseller", "local"], added: 20 },
  { id: "b2", slug: "vitamin-c-serum", name: "Vitamin C Brightening Serum", category: "beauty", brand: "Glow Lab",
    description: "15% vitamin C serum with hyaluronic acid for a brighter, even tone.",
    price: 1799, images: [u("1620916566398-39f1143ab7be"), u("1608248543803-ba4f8c70ae0b")],
    sizes: ["30ml"], colors: ["Natural"], countInStock: 5, numSales: 95,
    avgRating: 4.5, numReviews: 20, isFeatured: false, flashSale: false, tags: ["low-stock"], added: 22 },
  { id: "b3", slug: "matte-lip-set", name: "Matte Liquid Lip Set", category: "beauty", brand: "Huddah",
    description: "A trio of long-wear matte liquid lipsticks in everyday nudes.",
    price: 1499, listPrice: 2100, images: [u("1586495777744-4413f21062fa"), u("1631214524020-7e18db9a8f92")],
    sizes: [], colors: ["Nude", "Brick", "Rose"], countInStock: 33, numSales: 160,
    avgRating: 4.3, numReviews: 29, isFeatured: false, flashSale: true, flashSalePrice: 1199, flashSaleEnd: soon, tags: ["sale"], added: 24 },
  { id: "b4", slug: "argan-hair-oil", name: "Argan Hair Oil", category: "beauty", brand: "Pure Africa",
    description: "Lightweight argan oil that tames frizz and adds shine without grease.",
    price: 1199, images: [u("1608571423902-eed4a5ad8108"), u("1596433809252-0e2b6bb5ed47")],
    sizes: ["50ml", "100ml"], colors: ["Natural"], countInStock: 44, numSales: 110,
    avgRating: 4.6, numReviews: 16, isFeatured: true, flashSale: false, tags: [], added: 18 },

  // ── Sports ────────────────────────────────────────────────
  { id: "sp1", slug: "yoga-mat-pro", name: "Pro Non-Slip Yoga Mat", category: "sports", brand: "Flex",
    description: "6mm cushioned, non-slip yoga mat with a carry strap.",
    price: 1999, listPrice: 2700, images: [u("1601925260368-ae2f83cf8b7f"), u("1518611012118-696072aa579a")],
    sizes: [], colors: ["Teal", "Purple", "Charcoal"], countInStock: 26, numSales: 130,
    avgRating: 4.5, numReviews: 21, isFeatured: false, flashSale: false, tags: [], added: 16 },
  { id: "sp2", slug: "adjustable-dumbbells", name: "Adjustable Dumbbell 20kg", category: "sports", brand: "IronCore",
    description: "Space-saving adjustable dumbbell, 2.5–20kg per hand.",
    price: 8999, listPrice: 11500, images: [u("1638536532686-d610adfc8e5c"), u("1571019613454-1cb2f99b2d8b")],
    sizes: [], colors: ["Black"], countInStock: 8, numSales: 50,
    avgRating: 4.7, numReviews: 12, isFeatured: true, flashSale: false, tags: [], added: 21 },
  { id: "sp3", slug: "training-football", name: "Match Training Football", category: "sports", brand: "Score",
    description: "Size-5 machine-stitched football for training and weekend matches.",
    price: 1499, images: [u("1614632537190-23e4146777db"), u("1579952363873-27f3bade9f55")],
    sizes: [], colors: ["White/Black"], countInStock: 40, numSales: 180,
    avgRating: 4.4, numReviews: 26, isFeatured: false, flashSale: false, tags: [], added: 12 },
  { id: "sp4", slug: "compression-tee", name: "Compression Training Tee", category: "sports", brand: "Flex",
    description: "Moisture-wicking compression tee that moves with you.",
    price: 1799, listPrice: 2300, images: [u("1556817411-31ae72fa3ea0"), u("1593079831268-3381b0db4a77")],
    sizes: ["S", "M", "L", "XL"], colors: ["Black", "Navy", "Red"], countInStock: 3, numSales: 90,
    avgRating: 4.2, numReviews: 14, isFeatured: false, flashSale: false, tags: ["low-stock"], added: 19 },
];

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

export const reviews: Review[] = [
  { id: "r1", productSlug: "comrade-oversized-tee", name: "Brian K.", rating: 5, comment: "Thick material, true to size. Bought three.", date: "2026-05-02" },
  { id: "r2", productSlug: "comrade-oversized-tee", name: "Aisha M.", rating: 4, comment: "Lovely fit, the white is a little see-through.", date: "2026-04-21" },
  { id: "r3", productSlug: "comrade-oversized-tee", name: "Dennis O.", rating: 5, comment: "Best plain tee I've found in Nairobi.", date: "2026-03-30" },
  { id: "r4", productSlug: "street-runner-sneakers", name: "Faith W.", rating: 5, comment: "Super light and comfy for the daily commute.", date: "2026-05-10" },
  { id: "r5", productSlug: "street-runner-sneakers", name: "Kevin M.", rating: 4, comment: "Great value, delivery to CBD was next day.", date: "2026-04-18" },
  { id: "r6", productSlug: "wireless-anc-headphones", name: "Mercy A.", rating: 5, comment: "ANC is genuinely good for the matatu ride.", date: "2026-05-14" },
  { id: "r7", productSlug: "wireless-anc-headphones", name: "Tom G.", rating: 4, comment: "Battery lasts forever. Bass could be deeper.", date: "2026-04-29" },
  { id: "r8", productSlug: "20000mah-power-bank", name: "Joy N.", rating: 5, comment: "Charges my phone like 4 times. Solid.", date: "2026-05-01" },
  { id: "r9", productSlug: "shea-body-butter", name: "Wanjiku R.", rating: 5, comment: "Pure and rich, a little goes a long way.", date: "2026-05-07" },
  { id: "r10", productSlug: "shea-body-butter", name: "Linet C.", rating: 5, comment: "Smells amazing and not greasy at all.", date: "2026-04-11" },
  { id: "r11", productSlug: "ankara-print-shirt", name: "Otieno J.", rating: 5, comment: "Got compliments all day. Quality stitching.", date: "2026-05-09" },
  { id: "r12", productSlug: "ceramic-mug-set", name: "Sharon T.", rating: 4, comment: "Beautiful colours, bigger than expected.", date: "2026-04-25" },
  { id: "r13", productSlug: "trail-hiking-boots", name: "Peter M.", rating: 5, comment: "Took them up Ngong hills, feet stayed dry.", date: "2026-05-03" },
  { id: "r14", productSlug: "adjustable-dumbbells", name: "Caleb K.", rating: 5, comment: "Saves so much space in the apartment.", date: "2026-04-30" },
];

/* ------------------------------------------------------------------ */
/*  Banners                                                            */
/* ------------------------------------------------------------------ */

export const banners: Banner[] = [
  { id: "bn1", title: "Mid-month deals, sorted.", subtitle: "Up to 35% off across electronics, shoes & fashion — while stock lasts.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80",
    link: "/flash-sales", cta: "Shop flash sales" },
  { id: "bn2", title: "New season fits", subtitle: "Fresh arrivals for the Nairobi everyday.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80",
    link: "/category/fashion", cta: "Shop fashion" },
];

/* ------------------------------------------------------------------ */
/*  Coupons                                                            */
/* ------------------------------------------------------------------ */

export const coupons: Coupon[] = [
  { code: "KARIBU10", type: "percentage", value: 10, minOrder: 0, description: "10% off your first order" },
  { code: "COMRADE500", type: "fixed", value: 500, minOrder: 3000, description: "Ksh 500 off orders over Ksh 3,000" },
  { code: "FLASH15", type: "percentage", value: 15, minOrder: 2000, description: "15% off orders over Ksh 2,000" },
];

/* ------------------------------------------------------------------ */
/*  Query helpers                                                      */
/* ------------------------------------------------------------------ */

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getByCategory = (slug: string) => products.filter((p) => p.category === slug);
export const getReviewsFor = (slug: string) =>
  reviews.filter((r) => r.productSlug === slug).sort((a, b) => +new Date(b.date) - +new Date(a.date));
export const getCoupon = (code: string) =>
  coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

export const categoryCount = (slug: string) => getByCategory(slug).length;

export const featuredProducts = () => products.filter((p) => p.isFeatured);
export const newArrivals = (n = 12) => [...products].sort((a, b) => b.added - a.added).slice(0, n);
export const trending = (n = 12) => [...products].sort((a, b) => b.numSales - a.numSales).slice(0, n);
export const flashDeals = () => products.filter((p) => isFlashActive(p));

export type SortKey = "newest" | "price-asc" | "price-desc" | "rating" | "best-selling";

export type SearchFilters = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  minRating?: number;
  flashOnly?: boolean;
  sort?: SortKey;
};

export function searchProducts(filters: SearchFilters): Product[] {
  const { q, category, min, max, minRating, flashOnly, sort = "newest" } = filters;
  let list = [...products];

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
  if (typeof min === "number") list = list.filter((p) => effective(p) >= min);
  if (typeof max === "number") list = list.filter((p) => effective(p) <= max);
  if (typeof minRating === "number") list = list.filter((p) => p.avgRating >= minRating);
  if (flashOnly) list = list.filter((p) => isFlashActive(p));

  switch (sort) {
    case "price-asc": list.sort((a, b) => effective(a) - effective(b)); break;
    case "price-desc": list.sort((a, b) => effective(b) - effective(a)); break;
    case "rating": list.sort((a, b) => b.avgRating - a.avgRating); break;
    case "best-selling": list.sort((a, b) => b.numSales - a.numSales); break;
    default: list.sort((a, b) => b.added - a.added);
  }
  return list;
}

function effective(p: Product) {
  return isFlashActive(p) ? p.flashSalePrice ?? p.price : p.price;
}

/** Live search suggestions: matching products + most popular fallback. */
export function suggest(q: string, n = 6): Product[] {
  if (!q.trim()) return trending(n);
  return searchProducts({ q, sort: "best-selling" }).slice(0, n);
}

export const priceOf = effective;


/* ------------------------------------------------------------------ */
/*  Shops (multivendor)                                                */
/* ------------------------------------------------------------------ */

export type Shop = {
  slug: string;
  name: string;
  blurb: string;
  logo: string;
  headerColor: string; // unique colour for the shop header
  bagFee: number;
  discountPct: number;
  deliveryFee?: number;
};

export const shops: Shop[] = [
  { slug: "k-thrift", name: "K-Thrift", blurb: "Curated thrift & vintage fashion finds.", headerColor: "#7c3a52", bagFee: 30, discountPct: 0,
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80" },
  { slug: "dr-martens", name: "Dr. Martens", blurb: "Iconic boots, loafers & leather goods.", headerColor: "#2f3437", bagFee: 0, discountPct: 0,
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" },
  { slug: "glass-world", name: "Glass World", blurb: "Customised glasses, frames & eyewear.", headerColor: "#3b7d8c", bagFee: 50, discountPct: 0,
    logo: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=400&q=80" },
  { slug: "volthub", name: "VoltHub Electronics", blurb: "Power banks, audio & everyday gadgets.", headerColor: "#1f6f63", bagFee: 40, discountPct: 0,
    logo: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80" },
  { slug: "casa-comrade", name: "Casa Comrade", blurb: "Home, kitchen & living essentials.", headerColor: "#8a5a2b", bagFee: 35, discountPct: 0,
    logo: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=400&q=80" },
  { slug: "glow-bar", name: "Glow Bar", blurb: "Beauty, skincare & self-care.", headerColor: "#b15a8f", bagFee: 25, discountPct: 0,
    logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80" },
  { slug: "peak-sports", name: "Peak Sports", blurb: "Fitness gear, sportswear & the outdoors.", headerColor: "#2d5fa3", bagFee: 30, discountPct: 0,
    logo: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80" },
];

export function getShop(slug: string): Shop | undefined {
  return shops.find((sh) => sh.slug === slug);
}

const categoryShop: Record<string, string> = {
  fashion: "k-thrift",
  shoes: "dr-martens",
  electronics: "volthub",
  "home-living": "casa-comrade",
  beauty: "glow-bar",
  sports: "peak-sports",
};

// Link every catalog product to a shop (fallback when there's no database).
products.forEach((pr) => {
  if (!pr.shop) pr.shop = categoryShop[pr.category] ?? "k-thrift";
});

export function getProductsByShop(slug: string): Product[] {
  return products.filter((pr) => pr.shop === slug);
}
