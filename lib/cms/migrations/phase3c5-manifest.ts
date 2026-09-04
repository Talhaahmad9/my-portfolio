import { DatePrecision } from "../types";

export type SchemaCapabilityStatus =
  | "SCHEMA_COMPATIBLE"
  | "SCHEMA_COMPATIBLE_WITH_INTERNAL_NORMALIZATION"
  | "SCHEMA_PRECISION_GAP"
  | "SCHEMA_REQUIRED_FIELD_GAP";

export type RoleActionType =
  | "CREATE"
  | "NOOP"
  | "CONFLICT"
  | "FATAL_CONFLICT"
  | "SCHEMA_BLOCKED"
  | "MANUAL_DATE_REQUIRED";

export interface RoleManifestTarget {
  manifestKey: string;
  targetId: string;
  roleTitle: string;
  organization: string;
  category: "professional" | "freelance" | "leadership" | "community";
  location?: string;
  startDate?: string;
  startDatePrecision?: DatePrecision;
  endDate?: string;
  endDatePrecision?: DatePrecision;
  sourceDateText: string;
  sourcePrecision: "month" | "year" | "none";
  isCurrent: boolean;
  summary: string;
  highlights: string[];
  metrics: unknown[];
  skillIds: string[];
  publicationStatus: "published";
  displayOrder: number;
  provenance: "USER_SUPPLIED";
  schemaCapability: SchemaCapabilityStatus;
  proposedAction: RoleActionType;
  completenessWarning?: string;
}

export interface EducationManifestTarget {
  manifestKey: string;
  targetId: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  startDatePrecision?: DatePrecision;
  endDate?: string;
  endDatePrecision?: DatePrecision;
  sourceDateText: string;
  sourcePrecision: "year" | "none";
  isCurrent: boolean;
  summary?: string;
  highlights: string[];
  publicationStatus: "published";
  displayOrder: number;
  provenance: "USER_SUPPLIED";
  schemaCapability: SchemaCapabilityStatus;
  proposedAction: RoleActionType;
}

export const LOCKED_ROLE_TARGETS: RoleManifestTarget[] = [
  {
    manifestKey: "role:staydue-founder",
    targetId: "6a99afe36f17c13f5ed6eb64",
    roleTitle: "Founder",
    organization: "StayDue",
    category: "professional",
    location: undefined,
    startDate: undefined,
    startDatePrecision: undefined,
    endDate: undefined,
    endDatePrecision: undefined,
    sourceDateText: "MANUAL_REQUIRED",
    sourcePrecision: "none",
    isCurrent: true,
    summary:
      "Founder of StayDue, a production SaaS for university deadline reminders and automated student notifications.",
    highlights: [
      "Built and operates the product as a production SaaS.",
      "Moodle calendar synchronization.",
      "Automated WhatsApp and email reminder delivery.",
      "Scheduled notification workflows with reliability safeguards.",
    ],
    metrics: [],
    skillIds: [],
    publicationStatus: "published",
    displayOrder: 0,
    provenance: "USER_SUPPLIED",
    schemaCapability: "SCHEMA_COMPATIBLE",
    proposedAction: "CREATE",
    completenessWarning: "START_DATE_NOT_AUTHORED",
  },
  {
    manifestKey: "role:ieee-cs-vice-chair",
    targetId: "6a99afe36f17c13f5ed6eb65",
    roleTitle: "Vice Chairperson",
    organization: "IEEE Computer Society at IoBM",
    category: "leadership",
    location: "Karachi, Pakistan",
    startDate: "2026-08-01T00:00:00.000Z",
    startDatePrecision: "month",
    endDate: undefined,
    endDatePrecision: undefined,
    sourceDateText: "Aug 2026 – Present",
    sourcePrecision: "month",
    isCurrent: true,
    summary:
      "Vice Chairperson of IEEE Computer Society at IoBM, helping plan and coordinate technical programming for the student community.",
    highlights: [
      "Plan and lead webinars and guest-speaker sessions.",
      "Help organize technical workshops and student technical events.",
      "Coordinate with speakers, faculty, and the student team.",
    ],
    metrics: [],
    skillIds: [],
    publicationStatus: "published",
    displayOrder: 1,
    provenance: "USER_SUPPLIED",
    schemaCapability: "SCHEMA_COMPATIBLE",
    proposedAction: "CREATE",
  },
  {
    manifestKey: "role:technova-director",
    targetId: "6a99afe36f17c13f5ed6eb66",
    roleTitle: "Director, Modules & Operations",
    organization: "TechNova — IEEE IoBM Student Branch",
    category: "leadership",
    location: "Karachi, Pakistan",
    startDate: "2026-03-01T00:00:00.000Z",
    startDatePrecision: "month",
    endDate: "2026-08-01T00:00:00.000Z",
    endDatePrecision: "month",
    sourceDateText: "Mar 2026 – Aug 2026",
    sourcePrecision: "month",
    isCurrent: false,
    summary:
      "Director, Modules & Operations for TechNova, IoBM's flagship hackathon, responsible for technical module coordination and event operations.",
    highlights: [
      "Led technical event and module coordination.",
      "Coordinated technical execution across competition modules.",
      "Managed module and event operations with the organizing team.",
    ],
    metrics: [],
    skillIds: [],
    publicationStatus: "published",
    displayOrder: 2,
    provenance: "USER_SUPPLIED",
    schemaCapability: "SCHEMA_COMPATIBLE",
    proposedAction: "CREATE",
  },
];

export const LOCKED_EDUCATION_TARGETS: EducationManifestTarget[] = [
  {
    manifestKey: "education:iobm-bscs",
    targetId: "6a99afe46f17c13f5ed6eb67",
    institution: "Institute of Business Management (IoBM)",
    degree: "BS Computer Science",
    field: undefined,
    location: "Karachi, Pakistan",
    startDate: undefined,
    startDatePrecision: undefined,
    endDate: "2027-01-01T00:00:00.000Z",
    endDatePrecision: "year",
    sourceDateText: "Expected 2027",
    sourcePrecision: "year",
    isCurrent: true,
    summary: undefined,
    highlights: [],
    publicationStatus: "published",
    displayOrder: 0,
    provenance: "USER_SUPPLIED",
    schemaCapability: "SCHEMA_COMPATIBLE",
    proposedAction: "CREATE",
  },
];
