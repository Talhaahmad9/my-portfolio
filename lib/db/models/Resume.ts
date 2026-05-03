import mongoose, { Document, Model, Schema } from "mongoose";
import { connectDB } from "@/lib/db/mongo";

export interface IResume extends Document {
  label: string;
  fileUrl: string;
  isActive: boolean;
  uploadedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  label: {
    type: String,
    required: true,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

await connectDB();

export const ResumeModel: Model<IResume> =
  (mongoose.models.Resume as Model<IResume>) ??
  mongoose.model<IResume>("Resume", ResumeSchema);
