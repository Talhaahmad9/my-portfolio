import mongoose, { Document, Model, Schema } from "mongoose";
import { connectDB } from "@/lib/db/mongo";

export interface IWin extends Document {
  title: string;
  event: string;
  place: string;
  score?: string;
  date: Date;
  description?: string;
  stack?: string[];
}

const WinSchema = new Schema<IWin>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  event: {
    type: String,
    required: true,
    trim: true,
  },
  place: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  stack: {
    type: [String],
  },
});

await connectDB();

export const WinModel: Model<IWin> =
  (mongoose.models.Win as Model<IWin>) ??
  mongoose.model<IWin>("Win", WinSchema);
