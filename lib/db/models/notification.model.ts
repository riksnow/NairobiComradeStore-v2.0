import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export interface INotification {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: "order" | "review" | "system" | "promotion";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification =
  (models.Notification as Model<INotification>) ||
  model<INotification>("Notification", NotificationSchema);
export default Notification;
