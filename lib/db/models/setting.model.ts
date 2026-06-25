import mongoose, { Schema, model, models, type Model, type Types } from "mongoose";

export interface ISetting {
  _id: Types.ObjectId;
  key: string; // singleton key, e.g. "store"
  storeName: string;
  supportPhone?: string;
  supportEmail?: string;
  address?: string;
  whatsapp?: string;
  instagram?: string;
  emailConfig: {
    sendOrderEmails: boolean;
    sendNewsletter: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, default: "store" },
    storeName: { type: String, default: "Nairobi Comrade Store" },
    supportPhone: { type: String },
    supportEmail: { type: String },
    address: { type: String },
    whatsapp: { type: String },
    instagram: { type: String },
    emailConfig: {
      sendOrderEmails: { type: Boolean, default: true },
      sendNewsletter: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Setting =
  (models.Setting as Model<ISetting>) || model<ISetting>("Setting", SettingSchema);
export default Setting;
