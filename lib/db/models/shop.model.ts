import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IShop {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  blurb?: string;
  logo?: string;
  banner?: string;
  headerColor: string;   // unique brand colour for the shop header
  bagFee: number;        // flat per-order fee when buying from this shop
  deliveryFee?: number;  // optional shop delivery override
  discountPct: number;   // % off this shop's items
  isActive: boolean;
  isSuspended: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    blurb: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    headerColor: { type: String, default: "#c96442" },
    bagFee: { type: Number, default: 0 },
    deliveryFee: { type: Number },
    discountPct: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Shop = (models.Shop as Model<IShop>) || model<IShop>("Shop", ShopSchema);
export default Shop;
