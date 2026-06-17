import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  listPrice?: number;
  images: string[];
  category: string;
  brand?: string;
  tags: string[];
  sizes: string[];
  colors: string[];
  countInStock: number;
  numSales: number;
  avgRating: number;
  numReviews: number;
  isPublished: boolean;
  isFeatured: boolean;
  flashSale: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    listPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    brand: { type: String, trim: true },
    tags: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    countInStock: { type: Number, default: 0, min: 0 },
    numSales: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    flashSale: { type: Boolean, default: false },
    flashSalePrice: { type: Number, min: 0 },
    flashSaleEnd: { type: Date },
  },
  { timestamps: true }
);

ProductSchema.index({ isPublished: 1, isFeatured: 1 });

const Product =
  (models.Product as Model<IProduct>) || model<IProduct>("Product", ProductSchema);
export default Product;
