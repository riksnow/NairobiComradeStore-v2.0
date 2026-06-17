import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";

export interface IAddress {
  _id?: Types.ObjectId;
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  isDefault: boolean;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // optional for Google-only accounts
  role: "Customer" | "Admin";
  phone?: string;
  avatar?: string;
  isActive: boolean;
  addresses: Types.DocumentArray<IAddress>;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, default: "Nairobi", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String },
    role: { type: String, enum: ["Customer", "Admin"], default: "Customer" },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    addresses: { type: [AddressSchema], default: [] },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

const User = (models.User as Model<IUser>) || model<IUser>("User", UserSchema);
export default User;
