import { connectDB } from "@/lib/db/mongo";
import { AwardModel, IAward } from "@/lib/db/models/Award";
import { EventModel, IEvent } from "@/lib/db/models/Event";
import { ProjectModel, IProject } from "@/lib/db/models/Project";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { EducationModel, IEducation } from "@/lib/db/models/Education";
import { Types } from "mongoose";

export interface PublicAchievementHighlight {
  id: string;
  title: string;
  event: string;
  place: string;
  score?: string;
  description?: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface PublicEducationHighlight {
  id: string;
  degree: string;
  institution: string;
  periodText: string;
}

export interface PublicAboutHighlights {
  achievements: PublicAchievementHighlight[];
  education?: PublicEducationHighlight;
}

/**
 * Fetches canonical Award and Education records for the AboutSection highlight slideshow.
 * Strictly queries published records without N+1 queries.
 */
export async function getPublicAboutHighlights(): Promise<PublicAboutHighlights> {
  await connectDB();

  // 1. Fetch published Awards sorted by displayOrder, then createdAt
  const awardDocs = (await AwardModel.find({ publicationStatus: "published" })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean()) as unknown as (IAward & { _id: Types.ObjectId })[];

  // Collect unique relationship IDs for batch fetching
  const eventIds = Array.from(
    new Set(awardDocs.map((a) => a.relatedEventId?.toString()).filter(Boolean))
  ) as string[];

  const projectIds = Array.from(
    new Set(awardDocs.map((a) => a.relatedProjectId?.toString()).filter(Boolean))
  ) as string[];

  const skillIds = Array.from(
    new Set(
      awardDocs.flatMap((a) => (a.skillIds || []).map((s) => s.toString()))
    )
  ) as string[];

  // Batch query relationships
  const [eventDocs, projectDocs, skillDocs, educationDocs] = await Promise.all([
    eventIds.length > 0
      ? (EventModel.find({ _id: { $in: eventIds } }).lean() as unknown as Promise<(IEvent & { _id: Types.ObjectId })[]>)
      : Promise.resolve([]),
    projectIds.length > 0
      ? (ProjectModel.find({ _id: { $in: projectIds } }).lean() as unknown as Promise<(IProject & { _id: Types.ObjectId })[]>)
      : Promise.resolve([]),
    skillIds.length > 0
      ? (SkillModel.find({ _id: { $in: skillIds } }).lean() as unknown as Promise<(ISkill & { _id: Types.ObjectId })[]>)
      : Promise.resolve([]),
    EducationModel.find({ publicationStatus: "published" })
      .sort({ displayOrder: 1, createdAt: 1 })
      .limit(1)
      .lean() as unknown as Promise<(IEducation & { _id: Types.ObjectId })[]>,
  ]);

  const eventMap = new Map<string, IEvent>();
  for (const e of eventDocs) {
    eventMap.set(e._id.toString(), e);
  }

  const projectMap = new Map<string, IProject>();
  for (const p of projectDocs) {
    projectMap.set(p._id.toString(), p);
  }

  const skillMap = new Map<string, ISkill>();
  for (const s of skillDocs) {
    skillMap.set(s._id.toString(), s);
  }

  const achievements: PublicAchievementHighlight[] = awardDocs.map((award) => {
    const event = award.relatedEventId ? eventMap.get(award.relatedEventId.toString()) : null;
    const project = award.relatedProjectId ? projectMap.get(award.relatedProjectId.toString()) : null;

    // Title formatting using canonical Award and Event relationship metadata
    let title = award.title.replace(/^[0-9]+(st|nd|rd|th)\s+Place\s*—\s*/i, "");
    if (event?.title && event.projectIds && event.projectIds.length > 0) {
      title = event.title;
    }

    const eventLabel = event?.organizer || award.issuer || "";
    const stack = (award.skillIds || [])
      .map((sid) => skillMap.get(sid.toString())?.name)
      .filter((n): n is string => Boolean(n));

    return {
      id: award._id.toString(),
      title,
      event: eventLabel,
      place: award.placement || "1st Place",
      score: award.score || undefined,
      description: award.summary || award.description || undefined,
      stack,
      liveUrl: project?.demoUrl || undefined,
      githubUrl: project?.githubUrl || undefined,
    };
  });

  let education: PublicEducationHighlight | undefined = undefined;
  if (educationDocs.length > 0) {
    const edu = educationDocs[0]!;
    const shortInst = edu.institution.includes("IoBM") ? "IoBM, Karachi" : edu.institution;
    const startStr = edu.startDate
      ? new Date(edu.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "Sep 2023";
    const statusStr = edu.isCurrent ? "Present" : "";
    const endStr = edu.endDate ? `Expected ${new Date(edu.endDate).getFullYear()}` : "";
    const periodText = [startStr ? `${startStr} – ${statusStr}` : statusStr, endStr].filter(Boolean).join(" · ");

    education = {
      id: edu._id.toString(),
      degree: edu.degree,
      institution: `${edu.degree} — ${shortInst}`,
      periodText,
    };
  }

  return {
    achievements,
    education,
  };
}
