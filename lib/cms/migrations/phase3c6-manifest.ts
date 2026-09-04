export type ProjectRelationshipAction =
  | "LINK"
  | "NOOP"
  | "MANUAL_REVIEW_REQUIRED"
  | "FATAL_DEPENDENCY_ERROR";

export type EventActionType =
  | "CREATE"
  | "NOOP"
  | "CONFLICT"
  | "FATAL_CONFLICT"
  | "DATE_BLOCKED"
  | "SCHEMA_BLOCKED";

export interface StayDueProjectLinkTarget {
  manifestKey: string;
  projectId: string;
  slug: string;
  targetRoleId: string;
  targetRoleTitle: string;
  targetOrganization: string;
  proposedAction: ProjectRelationshipAction;
}

export interface TechNovaEventTarget {
  manifestKey: string;
  targetId: string;
  title: string;
  eventType: "hackathon";
  organizer: string;
  startDate: string;
  endDate: string;
  summary: string;
  featured: boolean;
  roleIds: string[];
  projectIds: string[];
  skillIds: string[];
  publicationStatus: "published";
  displayOrder: number;
  dateSource: string;
  rawDateValue: string;
  datePrecision: "day";
  dateClassification: "DATE_CONFIRMED_DAY";
  schemaCapability: "SCHEMA_COMPATIBLE";
  proposedAction: EventActionType;
}

export const STAYDUE_LINK_TARGET: StayDueProjectLinkTarget = {
  manifestKey: "project:staydue:role-link",
  projectId: "69fae5d7da84ac20e090e2e6",
  slug: "staydue",
  targetRoleId: "6a99afe36f17c13f5ed6eb64",
  targetRoleTitle: "Founder",
  targetOrganization: "StayDue",
  proposedAction: "LINK",
};

export const TECHNOVA_EVENT_TARGET: TechNovaEventTarget = {
  manifestKey: "event:technova",
  targetId: "6a99afe16f17c13f5ed6eb68",
  title: "TechNova",
  eventType: "hackathon",
  organizer: "IEEE IoBM Student Branch",
  startDate: "2026-07-11T00:00:00.000Z",
  endDate: "2026-07-12T00:00:00.000Z",
  summary: "IoBM's flagship hackathon organized by IEEE IoBM Student Branch.",
  featured: false,
  roleIds: ["6a99afe36f17c13f5ed6eb66"],
  projectIds: [],
  skillIds: [],
  publicationStatus: "published",
  displayOrder: 2,
  dateSource: "PROJECT_CV_RECORDS_AUTHORITATIVE",
  rawDateValue: "July 11–12, 2026",
  datePrecision: "day",
  dateClassification: "DATE_CONFIRMED_DAY",
  schemaCapability: "SCHEMA_COMPATIBLE",
  proposedAction: "CREATE",
};
