import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/constants";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
}

export interface IStatusHistory {
  status: string;
  note?: string;
  timestamp: Date;
  updatedBy?: Types.ObjectId;
}

export interface IOrder {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    area: string;
    city: string;
  };
  paymentMethod: "M-Pesa" | "Cash on Delivery";
  paymentResult?: {
    id?: string;
    status?: string;
    transactionId?: string;
    phone?: string;
    amount?: number;
    updatedAt?: Date;
  };
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  isPaid: boolean;
  paidAt?: Date;
  status: string;
  statusHistory: IStatusHistory[];
  notes?: string;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  emailsSent: {
    confirmation: boolean;
    processing: boolean;
    shipped: boolean;
    delivered: boolean;
    cancelled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, required: true },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: "Nairobi" },
    },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentResult: {
      id: String,
      status: String,
      transactionId: String,
      phone: String,
      amount: Number,
      updatedAt: Date,
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    status: { type: String, enum: ORDER_STATUSES, default: "Pending", index: true },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    notes: { type: String },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    emailsSent: {
      confirmation: { type: Boolean, default: false },
      processing: { type: Boolean, default: false },
      shipped: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      cancelled: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Order = (models.Order as Model<IOrder>) || model<IOrder>("Order", OrderSchema);
export default Order;
