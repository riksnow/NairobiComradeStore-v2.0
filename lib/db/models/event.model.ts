import { Schema, model, models, type Model, type Types } from "mongoose";

export type EventType = "pageview" | "search" | "view_product" | "view_shop";

export interface IEvent {
  _id: Types.ObjectId;
  type: EventType;
  query?: string;     // search term
  slug?: string;      // product/shop slug
  name?: string;      // denormalised display name
  path?: string;      // pageview path
  visitorId?: string; // anonymous visitor id
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    type: { type: String, required: true, index: true },
    query: { type: String },
    slug: { type: String },
    name: { type: String },
    path: { type: String },
    visitorId: { type: String, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);
EventSchema.index({ type: 1, createdAt: -1 });

const Event = (models.Event as Model<IEvent>) || model<IEvent>("Event", EventSchema);
export default Event;
