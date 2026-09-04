import mongoose, { Document, Model, Schema } from "mongoose";
import { DatePrecision, PublicationStatus } from "@/lib/cms/types";

export interface IEducation extends Document {
  institution: string;
  degree: string;
  field?: string;
  startDate?: Date;
  startDatePrecision?: DatePrecision;
  endDate?: Date;
  endDatePrecision?: DatePrecision;
  isCurrent?: boolean;
  location?: string;
  summary?: string;
  highlights?: string[];
  displayOrder?: number;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    field: { type: String, trim: true },
    startDate: { type: Date },
    startDatePrecision: {
      type: String,
      enum: ["day", "month", "year"],
      validate: {
        validator: function (this: IEducation, v?: string) {
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
        validator: function (this: IEducation, v?: string) {
          if (this.endDate && !v) return false;
          return true;
        },
        message: "endDatePrecision is required when endDate is provided.",
      },
    },
    isCurrent: { type: Boolean, default: false },
    location: { type: String, trim: true },
    summary: { type: String, trim: true },
    highlights: { type: [String], default: [] },
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

export const EducationModel: Model<IEducation> =
  (mongoose.models.Education as Model<IEducation>) ??
  mongoose.model<IEducation>("Education", EducationSchema);
