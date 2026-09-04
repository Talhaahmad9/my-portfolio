import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { PublicationStatus } from "@/lib/cms/types";

export interface ITechnicalDecision {
  title: string;
  context: string;
  decision: string;
  consequences: string[];
}

export interface ITechnicalChallenge {
  title: string;
  problem: string;
  solution: string;
  impact: string;
}

export interface IMetric {
  label: string;
  value: string;
  change?: string;
}

export interface ISEOOverride {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface IProject extends Document {
  title: string;
  slug?: string;
  tagline?: string;
  shortDescription?: string;
  longDescription?: string;
  publicationStatus?: PublicationStatus;
  isFeatured?: boolean;
  displayOrder?: number;
  featuredOrder?: number;
  projectType?: "personal" | "commercial" | "open_source" | "client" | "academic";
  category?: "ai_agents" | "fullstack" | "systems" | "cloud_devops" | "frontend" | "other";
  thumbnailUrl?: string;
  bannerUrl?: string;
  architectureDiagramUrl?: string;
  galleryUrls?: string[];
  techStack?: string[];
  architectureOverview?: string;
  technicalDecisions?: ITechnicalDecision[];
  challenges?: ITechnicalChallenge[];
  outcomes?: string[];
  metrics?: IMetric[];
  skillIds?: Types.ObjectId[];
  roleIds?: Types.ObjectId[];
  documentationUrl?: string;
  demoUrl?: string;
  seo?: ISEOOverride;
  schemaVersion?: number;

  // Legacy fields retained for backwards compatibility without canonical replacements
  images?: string[];
  imageFit?: "cover" | "contain";
  githubUrl?: string;
  badge?: string;

  createdAt: Date;
  updatedAt: Date;
}

const TechnicalDecisionSchema = new Schema<ITechnicalDecision>(
  {
    title: { type: String, required: true, trim: true },
    context: { type: String, required: true, trim: true },
    decision: { type: String, required: true, trim: true },
    consequences: { type: [String], default: [] },
  },
  { _id: false }
);

const TechnicalChallengeSchema = new Schema<ITechnicalChallenge>(
  {
    title: { type: String, required: true, trim: true },
    problem: { type: String, required: true, trim: true },
    solution: { type: String, required: true, trim: true },
    impact: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const MetricSchema = new Schema<IMetric>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    change: { type: String, trim: true },
  },
  { _id: false }
);

const SEOOverrideSchema = new Schema<ISEOOverride>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    tagline: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    longDescription: { type: String, trim: true },
    publicationStatus: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    featuredOrder: { type: Number, default: 0 },
    projectType: {
      type: String,
      enum: ["personal", "commercial", "open_source", "client", "academic"],
    },
    category: {
      type: String,
      enum: ["ai_agents", "fullstack", "systems", "cloud_devops", "frontend", "other"],
    },
    thumbnailUrl: { type: String, trim: true },
    bannerUrl: { type: String, trim: true },
    architectureDiagramUrl: { type: String, trim: true },
    galleryUrls: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    architectureOverview: { type: String, trim: true },
    technicalDecisions: { type: [TechnicalDecisionSchema], default: [] },
    challenges: { type: [TechnicalChallengeSchema], default: [] },
    outcomes: { type: [String], default: [] },
    metrics: { type: [MetricSchema], default: [] },
    skillIds: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    roleIds: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    documentationUrl: { type: String, trim: true },
    demoUrl: { type: String, trim: true },
    seo: { type: SEOOverrideSchema },
    schemaVersion: { type: Number },

    // Legacy fields
    images: { type: [String], default: [] },
    imageFit: { type: String, enum: ["cover", "contain"], default: "cover" },
    githubUrl: { type: String, trim: true },
    badge: { type: String, trim: true },
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

export const ProjectModel: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ??
  mongoose.model<IProject>("Project", ProjectSchema);
