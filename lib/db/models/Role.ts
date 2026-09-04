import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { DatePrecision, IMetric, MetricSchema, PublicationStatus, RoleCategory } from "@/lib/cms/types";

export interface IRole extends Document {
  roleTitle: string;
  organization: string;
  category: RoleCategory;
  location?: string;
  startDate?: Date;
  startDatePrecision?: DatePrecision;
  endDate?: Date;
  endDatePrecision?: DatePrecision;
  isCurrent: boolean;
  summary: string;
  description?: string;
  highlights: string[];
  metrics: IMetric[];
  skillIds: Types.ObjectId[];
  featured?: boolean;
  displayOrder?: number;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    roleTitle: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["professional", "freelance", "leadership", "community"],
      required: true,
    },
    location: { type: String, trim: true },
    startDate: { type: Date },
    startDatePrecision: {
      type: String,
      enum: ["day", "month", "year"],
      validate: {
        validator: function (this: IRole, v?: string) {
          if (this.startDate && !v) return false;
          return true;
        },
        message: "startDatePrecision is required when startDate is provided.",
      },
    },
    endDate: { type: Date },
    endDatePrecision: {
      type: String,
      enum: ["day", "month", "year"],
      validate: {
        validator: function (this: IRole, v?: string) {
          if (this.endDate && !v) return false;
          return true;
        },
        message: "endDatePrecision is required when endDate is provided.",
      },
    },
    isCurrent: { type: Boolean, default: false },
    summary: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    highlights: { type: [String], default: [] },
    metrics: { type: [MetricSchema], default: [] },
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

export const RoleModel: Model<IRole> =
  (mongoose.models.Role as Model<IRole>) ??
  mongoose.model<IRole>("Role", RoleSchema);
