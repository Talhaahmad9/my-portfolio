import mongoose, { Document, Model, Schema } from "mongoose";
import { PublicationStatus } from "@/lib/cms/types";

export interface ISkill extends Document {
  name: string;
  slug: string;
  category: string;
  summary?: string;
  featured?: boolean;
  displayOrder?: number;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    featured: { type: Boolean, default: false },
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

export const SkillModel: Model<ISkill> =
  (mongoose.models.Skill as Model<ISkill>) ??
  mongoose.model<ISkill>("Skill", SkillSchema);
