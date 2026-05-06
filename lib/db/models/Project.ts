import mongoose, { Document, Model, Schema } from "mongoose";
import { connectDB } from "@/lib/db/mongo";

export interface IProject extends Document {
  title: string;
  description: string;
  bullets: string[];
  tags: string[];
  images: string[];
  imageFit: "cover" | "contain";
  liveUrl?: string;
  githubUrl?: string;
  badge?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  bullets: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  imageFit: {
    type: String,
    enum: ["cover", "contain"],
    default: "cover",
  },
  liveUrl: {
    type: String,
  },
  githubUrl: {
    type: String,
  },
  badge: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

await connectDB();

export const ProjectModel: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ??
  mongoose.model<IProject>("Project", ProjectSchema);
