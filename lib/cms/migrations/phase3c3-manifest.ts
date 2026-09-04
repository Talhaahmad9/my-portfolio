import { EventType, AwardType, PublicationStatus } from "../types";

export interface EventMigrationTarget {
  id: string;
  manifestKey: string;
  title: string;
  eventType: EventType;
  organizer: string;
  startDateIso: string;
  rawSourceDates: string[];
  dateReviewStatus: "DATE_CONFIRMED" | "DATE_REVIEW_REQUIRED";
  projectIds: string[];
  roleIds: string[];
  skillIds: string[];
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface AwardMigrationTarget {
  id: string;
  manifestKey: string;
  title: string;
  awardType: AwardType;
  issuer: string;
  placement: string;
  score: string;
  dateIso: string;
  rawSourceDates: string[];
  dateReviewStatus: "DATE_CONFIRMED" | "DATE_REVIEW_REQUIRED";
  description: string;
  summary: string;
  metrics: Array<{ name: string; value: string; unit?: string }>;
  relatedProjectId?: string;
  relatedEventId: string;
  requiredSkillSlugs: string[];
  manualEnrichmentCandidates: string[];
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export const LOCKED_EVENT_TARGETS: EventMigrationTarget[] = [
  {
    id: "6a99afe16f17c13f5ed6eb60",
    manifestKey: "event:iba-hackfest-2026",
    title: "Hackfest × Datathon 2026",
    eventType: "hackathon",
    organizer: "IBA Karachi",
    startDateIso: "2026-02-14T00:00:00.000Z",
    rawSourceDates: ["2026-02-14T00:00:00.000Z"],
    dateReviewStatus: "DATE_CONFIRMED",
    projectIds: ["69faf2cfc176385097cea33e"], // Multi-Agent Simulation Engine
    roleIds: [],
    skillIds: [],
    publicationStatus: "published",
    displayOrder: 0,
  },
  {
    id: "6a99afe16f17c13f5ed6eb61",
    manifestKey: "event:fast-devday-2026",
    title: "DevDay 2026",
    eventType: "competition",
    organizer: "FAST NUCES, Karachi",
    startDateIso: "2026-04-30T00:00:00.000Z",
    rawSourceDates: ["2026-04-30T00:00:00.000Z"],
    dateReviewStatus: "DATE_CONFIRMED",
    projectIds: [],
    roleIds: [],
    skillIds: [],
    publicationStatus: "published",
    displayOrder: 1,
  },
];

export const LOCKED_AWARD_TARGETS: AwardMigrationTarget[] = [
  {
    id: "6a99afe26f17c13f5ed6eb62",
    manifestKey: "award:iba-hackfest-2026",
    title: "1st Place — GenAI Module",
    awardType: "competition",
    issuer: "IBA Karachi",
    placement: "1st Place",
    score: "88/100",
    dateIso: "2026-02-14T00:00:00.000Z",
    rawSourceDates: ["2026-02-14T00:00:00.000Z"],
    dateReviewStatus: "DATE_CONFIRMED",
    description:
      "Built a multi-agent simulation engine where AI agents collaborate to simulate an unfolding narrative. Competed against teams from LUMS, NUST, and other leading Pakistani universities.",
    summary: "Multi-agent narrative simulation engine",
    metrics: [],
    relatedProjectId: "69faf2cfc176385097cea33e",
    relatedEventId: "6a99afe16f17c13f5ed6eb60",
    requiredSkillSlugs: ["python", "langgraph", "google-gemini", "nextjs"],
    manualEnrichmentCandidates: ["Pydantic"],
    publicationStatus: "published",
    displayOrder: 0,
  },
  {
    id: "6a99afe26f17c13f5ed6eb63",
    manifestKey: "award:fast-devday-2026",
    title: "1st Place — Guilty By Data, The Ashworth Affair",
    awardType: "competition",
    issuer: "FAST NUCES, Karachi",
    placement: "1st Place",
    score: "836/1000",
    dateIso: "2026-04-30T00:00:00.000Z",
    rawSourceDates: ["2026-04-30T00:00:00.000Z"],
    dateReviewStatus: "DATE_CONFIRMED",
    description: "Murder mystery data investigation. Competed as team Midnight Sons.",
    summary: "Murder mystery data investigation",
    metrics: [],
    relatedProjectId: undefined,
    relatedEventId: "6a99afe16f17c13f5ed6eb61",
    requiredSkillSlugs: ["python", "pandas", "numpy", "excel"],
    manualEnrichmentCandidates: [],
    publicationStatus: "published",
    displayOrder: 1,
  },
];
