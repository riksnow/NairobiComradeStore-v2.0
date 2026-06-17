import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * Recalculate a product's avgRating + numReviews from its approved reviews.
 * Safe to call after any create / update / delete / moderation action.
 */
export async function recalcProductRating(productId: Types.ObjectId | string) {
  const ReviewModel = (models.Review as Model<IReview>) || model<IReview>("Review", ReviewSchema);
  const ProductModel = models.Product;
  if (!ProductModel) return;

  const agg = await ReviewModel.aggregate<{
    _id: null;
    avg: number;
    count: number;
  }>([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avg = agg[0]?.avg ?? 0;
  const count = agg[0]?.count ?? 0;

  await ProductModel.findByIdAndUpdate(productId, {
    avgRating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
}

ReviewSchema.post("save", function (doc) {
  recalcProductRating(doc.product).catch(() => {});
});

ReviewSchema.post("findOneAndDelete", function (doc: IReview | null) {
  if (doc) recalcProductRating(doc.product).catch(() => {});
});

ReviewSchema.post("deleteOne", { document: true, query: false }, function (doc) {
  recalcProductRating((doc as unknown as IReview).product).catch(() => {});
});

const Review =
  (models.Review as Model<IReview>) || model<IReview>("Review", ReviewSchema);
export default Review;
