import { connectDB } from "@/lib/db/mongo";
import { AwardModel, IAward } from "@/lib/db/models/Award";
import { CertificationModel, ICertificationEntity } from "@/lib/db/models/Certification";
import { ProjectModel, IProject } from "@/lib/db/models/Project";
import { EventModel, IEvent } from "@/lib/db/models/Event";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { AwardType, PublicationStatus } from "@/lib/cms/types";
import { ResolvedChipItem } from "@/components/admin/cms/RelationshipChips";
import { formatCmsDate } from "@/lib/admin/cms-date";
import { Types } from "mongoose";

export interface PlainAward {
  _id: string;
  title: string;
  awardType: AwardType;
  issuer: string;
  placement?: string;
  score?: string;
  date: string;
  dateFormatted: string;
  summary?: string;
  description?: string;
  metrics?: Array<{ label: string; value: string; numericValue?: number; unit?: string; context?: string }>;
  relatedProjectId?: string;
  relatedProject?: ResolvedChipItem;
  relatedEventId?: string;
  relatedEvent?: ResolvedChipItem;
  skillIds: string[];
  skills: ResolvedChipItem[];
  featured?: boolean;
  displayOrder: number;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlainCertification {
  _id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  issueDateFormatted?: string;
  expiryDate?: string;
  expiryDateFormatted?: string;
  credentialId?: string;
  credentialUrl?: string;
  publicId?: string;
  description?: string;
  mediaUrl?: string;
  skillIds: string[];
  skills: ResolvedChipItem[];
  featured?: boolean;
  displayOrder: number;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export async function getCanonicalAwards(): Promise<{
  awards: PlainAward[];
  unresolvedRefs: { projects: number; events: number; skills: number };
}> {
  await connectDB();

  const awardDocs = await AwardModel.find()
    .sort({ date: -1, createdAt: -1 })
    .lean<IAward[]>();

  const projectIds = Array.from(
    new Set(awardDocs.map((a) => (a.relatedProjectId ? String(a.relatedProjectId) : null)).filter(Boolean))
  ) as string[];

  const eventIds = Array.from(
    new Set(awardDocs.map((a) => (a.relatedEventId ? String(a.relatedEventId) : null)).filter(Boolean))
  ) as string[];

  const skillIds = Array.from(
    new Set(awardDocs.flatMap((a) => a.skillIds ?? []).map((id) => String(id)))
  );

  const [projectDocs, eventDocs, skillDocs] = await Promise.all([
    ProjectModel.find({ _id: { $in: projectIds } }).select("title").lean<IProject[]>(),
    EventModel.find({ _id: { $in: eventIds } }).select("title").lean<IEvent[]>(),
    SkillModel.find({ _id: { $in: skillIds } }).select("name").lean<ISkill[]>(),
  ]);

  const projectMap = new Map<string, string>();
  for (const p of projectDocs) projectMap.set(String(p._id), p.title);

  const eventMap = new Map<string, string>();
  for (const e of eventDocs) eventMap.set(String(e._id), e.title);

  const skillMap = new Map<string, string>();
  for (const s of skillDocs) skillMap.set(String(s._id), s.name);

  let unresolvedProjectRefs = 0;
  let unresolvedEventRefs = 0;
  let unresolvedSkillRefs = 0;

  const awards: PlainAward[] = awardDocs.map((doc) => {
    let relatedProject: ResolvedChipItem | undefined;
    if (doc.relatedProjectId) {
      const pId = String(doc.relatedProjectId);
      const name = projectMap.get(pId);
      if (name) {
        relatedProject = { id: pId, name };
      } else {
        unresolvedProjectRefs++;
        relatedProject = { id: pId, name: `Missing Project (${pId})`, isMissing: true };
      }
    }

    let relatedEvent: ResolvedChipItem | undefined;
    if (doc.relatedEventId) {
      const eId = String(doc.relatedEventId);
      const name = eventMap.get(eId);
      if (name) {
        relatedEvent = { id: eId, name };
      } else {
        unresolvedEventRefs++;
        relatedEvent = { id: eId, name: `Missing Event (${eId})`, isMissing: true };
      }
    }

    const resolvedSkills: ResolvedChipItem[] = (doc.skillIds ?? []).map((id: Types.ObjectId | string) => {
      const idStr = String(id);
      const name = skillMap.get(idStr);
      if (!name) {
        unresolvedSkillRefs++;
        return { id: idStr, name: `Missing Skill (${idStr})`, isMissing: true };
      }
      return { id: idStr, name };
    });

    return {
      _id: String(doc._id),
      title: doc.title,
      awardType: doc.awardType,
      issuer: doc.issuer ?? "",
      placement: doc.placement,
      score: doc.score,
      date: doc.date ? new Date(doc.date).toISOString() : "",
      dateFormatted: formatCmsDate(doc.date, "day") ?? "",
      summary: doc.summary,
      description: doc.description,
      metrics: doc.metrics?.map((m) => ({
        label: m.label,
        value: m.value,
        numericValue: m.numericValue,
        unit: m.unit,
        context: m.context,
      })),
      relatedProjectId: doc.relatedProjectId ? String(doc.relatedProjectId) : undefined,
      relatedProject,
      relatedEventId: doc.relatedEventId ? String(doc.relatedEventId) : undefined,
      relatedEvent,
      skillIds: (doc.skillIds ?? []).map((id) => String(id)),
      skills: resolvedSkills,
      featured: doc.featured ?? false,
      displayOrder: doc.displayOrder ?? 0,
      publicationStatus: doc.publicationStatus,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
    };
  });

  return {
    awards,
    unresolvedRefs: {
      projects: unresolvedProjectRefs,
      events: unresolvedEventRefs,
      skills: unresolvedSkillRefs,
    },
  };
}

export async function getCanonicalCertifications(): Promise<{
  certifications: PlainCertification[];
  unresolvedSkillRefs: number;
}> {
  await connectDB();

  const certDocs = await CertificationModel.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean<ICertificationEntity[]>();

  const skillIds = Array.from(
    new Set(certDocs.flatMap((c) => c.skillIds ?? []).map((id) => String(id)))
  );

  const skillDocs = await SkillModel.find({ _id: { $in: skillIds } })
    .select("name")
    .lean<ISkill[]>();

  const skillMap = new Map<string, string>();
  for (const s of skillDocs) skillMap.set(String(s._id), s.name);

  let unresolvedSkillRefs = 0;

  const certifications: PlainCertification[] = certDocs.map((doc) => {
    const resolvedSkills: ResolvedChipItem[] = (doc.skillIds ?? []).map((id: Types.ObjectId | string) => {
      const idStr = String(id);
      const name = skillMap.get(idStr);
      if (!name) {
        unresolvedSkillRefs++;
        return { id: idStr, name: `Missing Skill (${idStr})`, isMissing: true };
      }
      return { id: idStr, name };
    });

    return {
      _id: String(doc._id),
      name: doc.name,
      issuer: doc.issuer,
      issueDate: doc.issueDate ? new Date(doc.issueDate).toISOString() : undefined,
      issueDateFormatted: doc.issueDate ? formatCmsDate(doc.issueDate, "day") ?? undefined : undefined,
      expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString() : undefined,
      expiryDateFormatted: doc.expiryDate ? formatCmsDate(doc.expiryDate, "day") ?? undefined : undefined,
      credentialId: doc.credentialId,
      credentialUrl: doc.credentialUrl,
      publicId: doc.publicId,
      description: doc.description,
      mediaUrl: doc.mediaUrl,
      skillIds: (doc.skillIds ?? []).map((id) => String(id)),
      skills: resolvedSkills,
      featured: false,
      displayOrder: doc.displayOrder ?? 0,
      publicationStatus: doc.publicationStatus,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
    };
  });

  return { certifications, unresolvedSkillRefs };
}
