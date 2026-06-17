import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";

export interface IBanner {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Banner =
  (models.Banner as Model<IBanner>) || model<IBanner>("Banner", BannerSchema);
export default Banner;
