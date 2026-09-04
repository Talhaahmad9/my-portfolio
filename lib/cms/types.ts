import { Schema, Types } from "mongoose";

// ─── Publication & Status Unions ──────────────────────────────────────────────

export type PublicationStatus = "draft" | "published" | "archived";

export type DatePrecision = "day" | "month" | "year";

export type ProjectStatus =
  | "active"
  | "maintained"
  | "completed"
  | "prototype"
  | "archived";

export type RoleCategory =
  | "professional"
  | "freelance"
  | "leadership"
  | "community";

export type EventType =
  | "hackathon"
  | "competition"
  | "workshop"
  | "webinar"
  | "conference"
  | "community"
  | "other";

export type AwardType =
  | "competition"
  | "recognition"
  | "academic"
  | "other";

// ─── Subdocument Interfaces ──────────────────────────────────────────────────

export interface IMetric {
  label: string;
  value: string;
  numericValue?: number;
  unit?: string;
  context?: string;
  displayOrder?: number;
}

export const MetricSchema = new Schema<IMetric>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    numericValue: { type: Number },
    unit: { type: String, trim: true },
    context: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface ISEOOverride {
  title?: string;
  description?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
}

export const SEOOverrideSchema = new Schema<ISEOOverride>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    ogImageUrl: { type: String, trim: true },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false }
);

// ─── Architecture Subdocuments ───────────────────────────────────────────────

export interface IProjectComponent {
  key: string;
  name: string;
  description: string;
  skillIds?: Types.ObjectId[];
  displayOrder?: number;
}

export const ProjectComponentSchema = new Schema<IProjectComponent>(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skillIds: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface IProjectConnection {
  from: string;
  to: string;
  label?: string;
  description?: string;
  displayOrder?: number;
}

export const ProjectConnectionSchema = new Schema<IProjectConnection>(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    description: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface IProjectArchitecture {
  summary?: string;
  components: IProjectComponent[];
  connections: IProjectConnection[];
}

export const ProjectArchitectureSchema = new Schema<IProjectArchitecture>(
  {
    summary: { type: String, trim: true },
    components: { type: [ProjectComponentSchema], default: [] },
    connections: { type: [ProjectConnectionSchema], default: [] },
  },
  { _id: false }
);

export interface ITechnicalDecision {
  title: string;
  decision: string;
  rationale: string;
  tradeoff?: string;
  displayOrder?: number;
}

export const TechnicalDecisionSchema = new Schema<ITechnicalDecision>(
  {
    title: { type: String, required: true, trim: true },
    decision: { type: String, required: true, trim: true },
    rationale: { type: String, required: true, trim: true },
    tradeoff: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface ITechnicalChallenge {
  title: string;
  challenge: string;
  resolution: string;
  outcome?: string;
  displayOrder?: number;
}

export const TechnicalChallengeSchema = new Schema<ITechnicalChallenge>(
  {
    title: { type: String, required: true, trim: true },
    challenge: { type: String, required: true, trim: true },
    resolution: { type: String, required: true, trim: true },
    outcome: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);
