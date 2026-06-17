import { NextResponse } from "next/server";
import { getModels } from "@/lib/db/get-models";
import { requireUser } from "@/lib/admin-guard";
import { resolveUserDoc } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const u = await requireUser();
  if (!u) return NextResponse.json({ canReview: false, reason: "signin" });
  if (!process.env.MONGODB_URI) return NextResponse.json({ canReview: true, reason: "demo" });
  try {
    const { Product, Order, Review, User } = await getModels();
    const userDoc = await resolveUserDoc(User, u);
    if (!userDoc) return NextResponse.json({ canReview: false, reason: "signin" });
    const product = await Product.findOne({ slug }).select("_id").lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productId = (product as any)?._id;
    if (!productId) return NextResponse.json({ canReview: false, reason: "missing" });
    const purchased = await Order.exists({ user: userDoc._id, "items.product": productId });
    if (!purchased) return NextResponse.json({ canReview: false, reason: "not-purchased" });
    const reviewed = await Review.exists({ product: productId, user: userDoc._id });
    return NextResponse.json({ canReview: true, hasReviewed: Boolean(reviewed) });
  } catch {
    return NextResponse.json({ canReview: false, reason: "error" });
  }
}
