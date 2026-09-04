import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { DatePrecision, EventType, PublicationStatus } from "@/lib/cms/types";

export interface IEvent extends Document {
  title: string;
  eventType: EventType;
  organizer?: string;
  startDate: Date;
  startDatePrecision?: DatePrecision;
  endDate?: Date;
  endDatePrecision?: DatePrecision;
  location?: string;
  summary?: string;
  highlights?: string[];
  projectIds: Types.ObjectId[];
  roleIds: Types.ObjectId[];
  skillIds: Types.ObjectId[];
  featured?: boolean;
  displayOrder?: number;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    eventType: {
      type: String,
      enum: [
        "hackathon",
        "competition",
        "workshop",
        "webinar",
        "conference",
        "community",
        "other",
      ],
      required: true,
    },
    organizer: { type: String, trim: true },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v?: Date) {
          const doc = this as unknown as Partial<IEvent>;
          if (v && !doc.startDatePrecision) return false;
          return true;
        },
        message: "startDatePrecision is required when startDate is provided.",
      },
    },
    startDatePrecision: {
      type: String,
      enum: ["day", "month", "year"],
      validate: {
        validator: function (v?: string) {
          const doc = this as unknown as Partial<IEvent>;
          if (v && !doc.startDate) return false;
          return true;
        },
        message: "startDate is required when startDatePrecision is provided.",
      },
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (v?: Date) {
          const doc = this as unknown as Partial<IEvent>;
          if (v && !doc.endDatePrecision) return false;
          return true;
        },
        message: "endDatePrecision is required when endDate is provided.",
      },
    },
    endDatePrecision: {
      type: String,
      enum: ["day", "month", "year"],
      validate: {
        validator: function (v?: string) {
          const doc = this as unknown as Partial<IEvent>;
          if (v && !doc.endDate) return false;
          return true;
        },
        message: "endDate is required when endDatePrecision is provided.",
      },
    },
    location: { type: String, trim: true },
    summary: { type: String, trim: true },
    highlights: { type: [String], default: [] },
    projectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    roleIds: [{ type: Schema.Types.ObjectId, ref: "Role" }],
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

export const EventModel: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ??
  mongoose.model<IEvent>("Event", EventSchema);
