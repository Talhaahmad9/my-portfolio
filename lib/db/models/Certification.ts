import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { PublicationStatus } from "@/lib/cms/types";

export interface ICertificationEntity extends Document {
  name: string;
  issuer: string;
  issueDate?: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  publicId?: string;
  description?: string;
  skillIds: Types.ObjectId[];
  mediaUrl?: string;
  displayOrder?: number;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema<ICertificationEntity>(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    credentialId: { type: String, trim: true },
    credentialUrl: { type: String, trim: true },
    publicId: { type: String, trim: true },
    description: { type: String, trim: true },
    skillIds: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    mediaUrl: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    publicationStatus: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

export const CertificationModel: Model<ICertificationEntity> =
  (mongoose.models.Certification as Model<ICertificationEntity>) ??
  mongoose.model<ICertificationEntity>("Certification", CertificationSchema);
