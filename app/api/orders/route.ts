import { NextResponse } from "next/server";
import { getProductBySlug, getCoupon, getShops } from "@/lib/data";
import { deliveryFeeFor, PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants";
import { initiateStkPush } from "@/lib/mpesa";
import { requireUser } from "@/lib/admin-guard";
import { serialize } from "@/lib/utils";
import { resolveUserDoc } from "@/lib/current-user";

export const dynamic = "force-dynamic";

type IncomingItem = { slug: string; qty: number; size?: string; color?: string; variant?: string };

export async function GET() {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.MONGODB_URI) return NextResponse.json([]);
  try {
    const { getModels } = await import("@/lib/db/get-models");
    const { Order, User } = await getModels();
    const userDoc = await resolveUserDoc(User, u);
    if (!userDoc) return NextResponse.json([]);
    const docs = await Order.find({ user: userDoc._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(serialize(docs));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
  const paymentMethod: PaymentMethod = body.paymentMethod;
  const shippingAddress = body.shippingAddress;

  if (!items.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }
  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.street) {
    return NextResponse.json({ error: "Incomplete shipping address" }, { status: 400 });
  }

  const validated: {
    slug: string; productId?: string; name: string; image: string; price: number; qty: number; size?: string; color?: string; variant?: string; shop?: string; shopName?: string;
  }[] = [];
  const shops = await getShops();
  const shopMap = new Map(shops.map((s) => [s.slug, s]));
  const shopsInCart = new Set<string>();
  let subtotal = 0;
  let shopDiscount = 0;
  for (const it of items) {
    const product = await getProductBySlug(it.slug);
    if (!product) return NextResponse.json({ error: `Unknown product: ${it.slug}` }, { status: 400 });
    const qty = Math.max(1, Math.min(Number(it.qty) || 1, product.countInStock || 1));
    const variantMatch = it.variant ? product.variants?.find((v) => v.label === it.variant) : undefined;
    const basePrice = product.flashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
    const listed = typeof variantMatch?.price === "number" ? variantMatch.price : basePrice;
    const shop = product.shop ? shopMap.get(product.shop) : undefined;
    const pct = shop?.discountPct ?? 0;
    const price = pct > 0 ? Math.round(listed * (1 - pct / 100)) : listed;
    if (pct > 0) shopDiscount += (listed - price) * qty;
    if (product.shop) shopsInCart.add(product.shop);
    subtotal += price * qty;
    validated.push({ slug: product.slug, productId: product.id, name: product.name, image: product.images[0] ?? "", price, qty, size: it.size, color: it.color, variant: it.variant, shop: product.shop, shopName: shop?.name });
  }
  // Sum each distinct shop's bag fee.
  let bagFee = 0;
  for (const slug of shopsInCart) bagFee += shopMap.get(slug)?.bagFee ?? 0;

  let discount = 0;
  let couponCode: string | undefined;
  if (body.couponCode) {
    const coupon = await getCoupon(String(body.couponCode));
    if (coupon && subtotal >= coupon.minOrder) {
      discount = coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
      couponCode = coupon.code;
    }
  }

  const deliveryFee = deliveryFeeFor(subtotal);
  const total = Math.max(0, subtotal - discount) + deliveryFee + bagFee;

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ ok: true, persisted: false, subtotal, deliveryFee, discount, bagFee, shopDiscount, total });
  }

  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });

  let mpesa: { ok: boolean; checkoutRequestId?: string; reason?: string } | undefined;
  if (paymentMethod === "M-Pesa") {
    const r = await initiateStkPush({
      phone: String(shippingAddress.phone).replace(/^0/, "254").replace(/\D/g, ""),
      amount: total, accountRef: "NCS", description: "NairobiComradeStore order",
    });
    mpesa = r.ok ? { ok: true, checkoutRequestId: r.checkoutRequestId } : { ok: false, reason: r.reason };
  }

  try {
    const { getModels } = await import("@/lib/db/get-models");
    const { Order, Notification, User } = await getModels();
    const userDoc = await resolveUserDoc(User, u);
    if (!userDoc) return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });
    const created = await Order.create({
      user: userDoc._id,
      items: validated.map((v) => ({ product: v.productId, name: v.name, image: v.image, price: v.price, qty: v.qty, size: v.size, color: v.color, variant: v.variant, shop: v.shop, shopName: v.shopName })),
      shippingAddress,
      paymentMethod,
      paymentResult: mpesa?.ok ? { id: mpesa.checkoutRequestId, status: "Pending" } : undefined,
      subtotal, deliveryFee, discount, bagFee, shopDiscount, couponCode, total,
      status: "Pending",
      statusHistory: [{ status: "Pending", timestamp: new Date(), note: "Order placed" }],
    });

    await Notification.create({
      user: userDoc._id, type: "order",
      title: "Order received",
      message: `We've received your order (${String(created._id).slice(-6).toUpperCase()}). We'll keep you posted.`,
      link: `/account/orders/${created._id}`,
    });

    try {
      const { sendOrderEmailForStatus } = await import("@/lib/order-emails");
      const kind = await sendOrderEmailForStatus(
        { _id: created._id, total: created.total, status: "Pending", emailsSent: created.emailsSent },
        u.email ?? "", u.name ?? "comrade"
      );
      if (kind) { created.emailsSent.confirmation = true; await created.save(); }
    } catch { /* ignore */ }

    return NextResponse.json({ ok: true, persisted: true, orderId: String(created._id), subtotal, deliveryFee, discount, bagFee, shopDiscount, total, mpesa });
  } catch {
    return NextResponse.json({ error: "Could not place order. Try again." }, { status: 500 });
  }
}
