import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { AwardType, IMetric, MetricSchema, PublicationStatus } from "@/lib/cms/types";

export interface IAward extends Document {
  title: string;
  awardType: AwardType;
  issuer?: string;
  placement?: string;
  score?: string;
  date: Date;
  summary?: string;
  description?: string;
  metrics: IMetric[];
  relatedProjectId?: Types.ObjectId;
  relatedEventId?: Types.ObjectId;
  skillIds: Types.ObjectId[];
  featured?: boolean;
  displayOrder?: number;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AwardSchema = new Schema<IAward>(
  {
    title: { type: String, required: true, trim: true },
    awardType: {
      type: String,
      enum: ["competition", "recognition", "academic", "other"],
      required: true,
      default: "competition",
    },
    issuer: { type: String, trim: true },
    placement: { type: String, trim: true },
    score: { type: String, trim: true },
    date: { type: Date, required: true },
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    metrics: { type: [MetricSchema], default: [] },
    relatedProjectId: { type: Schema.Types.ObjectId, ref: "Project" },
    relatedEventId: { type: Schema.Types.ObjectId, ref: "Event" },
    skillIds: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
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

export const AwardModel: Model<IAward> =
  (mongoose.models.Award as Model<IAward>) ??
  mongoose.model<IAward>("Award", AwardSchema);
