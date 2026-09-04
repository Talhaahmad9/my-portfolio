import { connectDB } from "@/lib/db/mongo";
import { EventModel, IEvent } from "@/lib/db/models/Event";
import { ProjectModel, IProject } from "@/lib/db/models/Project";
import { RoleModel, IRole } from "@/lib/db/models/Role";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { DatePrecision, EventType, PublicationStatus } from "@/lib/cms/types";
import { ResolvedChipItem } from "@/components/admin/cms/RelationshipChips";
import { formatCmsDateRange } from "@/lib/admin/cms-date";

export interface PlainEvent {
  _id: string;
  title: string;
  eventType: EventType;
  organizer?: string;
  startDate: string;
  startDatePrecision?: DatePrecision;
  endDate?: string;
  endDatePrecision?: DatePrecision;
  dateRangeText: string;
  location?: string;
  summary?: string;
  highlights: string[];
  projects: ResolvedChipItem[];
  roles: ResolvedChipItem[];
  skills: ResolvedChipItem[];
  featured?: boolean;
  displayOrder: number;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export async function getCanonicalEvents(): Promise<{
  events: PlainEvent[];
  unresolvedRefs: { projects: number; roles: number; skills: number };
}> {
  await connectDB();

  const eventDocs = await EventModel.find()
    .sort({ startDate: -1, createdAt: -1 })
    .lean<IEvent[]>();

  const allProjectIds = Array.from(new Set(eventDocs.flatMap((e) => e.projectIds ?? []).map((id) => String(id))));
  const allRoleIds = Array.from(new Set(eventDocs.flatMap((e) => e.roleIds ?? []).map((id) => String(id))));
  const allSkillIds = Array.from(new Set(eventDocs.flatMap((e) => e.skillIds ?? []).map((id) => String(id))));

  const [projectDocs, roleDocs, skillDocs] = await Promise.all([
    ProjectModel.find({ _id: { $in: allProjectIds } }).select("title").lean<IProject[]>(),
    RoleModel.find({ _id: { $in: allRoleIds } }).select("roleTitle organization").lean<IRole[]>(),
    SkillModel.find({ _id: { $in: allSkillIds } }).select("name").lean<ISkill[]>(),
  ]);

  const projectMap = new Map<string, string>();
  for (const p of projectDocs) projectMap.set(String(p._id), p.title);

  const roleMap = new Map<string, string>();
  for (const r of roleDocs) roleMap.set(String(r._id), `${r.roleTitle} — ${r.organization}`);

  const skillMap = new Map<string, string>();
  for (const s of skillDocs) skillMap.set(String(s._id), s.name);

  let unresolvedProjectRefs = 0;
  let unresolvedRoleRefs = 0;
  let unresolvedSkillRefs = 0;

  const events: PlainEvent[] = eventDocs.map((doc) => {
    const resolvedProjects: ResolvedChipItem[] = (doc.projectIds ?? []).map((id) => {
      const idStr = String(id);
      const name = projectMap.get(idStr);
      if (!name) {
        unresolvedProjectRefs++;
        return { id: idStr, name: `Missing Project (${idStr})`, isMissing: true };
      }
      return { id: idStr, name };
    });

    const resolvedRoles: ResolvedChipItem[] = (doc.roleIds ?? []).map((id) => {
      const idStr = String(id);
      const name = roleMap.get(idStr);
      if (!name) {
        unresolvedRoleRefs++;
        return { id: idStr, name: `Missing Role (${idStr})`, isMissing: true };
      }
      return { id: idStr, name };
    });

    const resolvedSkills: ResolvedChipItem[] = (doc.skillIds ?? []).map((id) => {
      const idStr = String(id);
      const name = skillMap.get(idStr);
      if (!name) {
        unresolvedSkillRefs++;
        return { id: idStr, name: `Missing Skill (${idStr})`, isMissing: true };
      }
      return { id: idStr, name };
    });

    const dateResult = formatCmsDateRange(
      doc.startDate,
      doc.startDatePrecision,
      doc.endDate,
      doc.endDatePrecision,
      false
    );

    return {
      _id: String(doc._id),
      title: doc.title,
      eventType: doc.eventType,
      organizer: doc.organizer,
      startDate: doc.startDate ? new Date(doc.startDate).toISOString() : "",
      startDatePrecision: doc.startDatePrecision,
      endDate: doc.endDate ? new Date(doc.endDate).toISOString() : undefined,
      endDatePrecision: doc.endDatePrecision,
      dateRangeText: dateResult.formatted,
      location: doc.location,
      summary: doc.summary,
      highlights: doc.highlights ?? [],
      projects: resolvedProjects,
      roles: resolvedRoles,
      skills: resolvedSkills,
      featured: doc.featured ?? false,
      displayOrder: doc.displayOrder ?? 0,
      publicationStatus: doc.publicationStatus,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
    };
  });

  return {
    events,
    unresolvedRefs: {
      projects: unresolvedProjectRefs,
      roles: unresolvedRoleRefs,
      skills: unresolvedSkillRefs,
    },
  };
}
