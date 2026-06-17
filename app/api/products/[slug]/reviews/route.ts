import { NextResponse } from "next/server";
import { getReviewsForProductSlug } from "@/lib/data";
import { getModels } from "@/lib/db/get-models";
import { requireUser } from "@/lib/admin-guard";
import { resolveUserDoc } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return NextResponse.json(await getReviewsForProductSlug(slug));
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating);
  const comment = (body?.comment ?? "").toString().trim();

  if (!(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: "A 1–5 rating is required." }, { status: 400 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });

  try {
    const { Product, Order, Review, User, recalcProductRating } = await getModels();
    const userDoc = await resolveUserDoc(User, u);
    if (!userDoc) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

    const product = await Product.findOne({ slug }).select("_id").lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productId = (product as any)?._id;
    if (!productId) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Only customers who have ordered this product can review it.
    const purchased = await Order.exists({ user: userDoc._id, "items.product": productId });
    if (!purchased) {
      return NextResponse.json({ error: "You can only review products you've ordered." }, { status: 403 });
    }

    // One review per product per user.
    const existing = await Review.findOne({ product: productId, user: userDoc._id });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.isApproved = false; // re-moderate edits
      await existing.save();
    } else {
      await Review.create({ product: productId, user: userDoc._id, name: userDoc.name, rating, comment });
    }
    await recalcProductRating(productId);
    return NextResponse.json({ ok: true, persisted: true, updated: Boolean(existing) });
  } catch {
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }
}
