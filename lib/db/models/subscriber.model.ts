import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";

export interface ISubscriber {
  _id: Types.ObjectId;
  email: string;
  subscribedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  subscribedAt: { type: Date, default: Date.now },
});

const Subscriber =
  (models.Subscriber as Model<ISubscriber>) ||
  model<ISubscriber>("Subscriber", SubscriberSchema);
export default Subscriber;
