import { connectDB } from "@/lib/db/mongo";
import { RoleModel, IRole } from "@/lib/db/models/Role";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { DatePrecision, PublicationStatus, RoleCategory } from "@/lib/cms/types";
import { ResolvedChipItem } from "@/components/admin/cms/RelationshipChips";
import { formatCmsDateRange } from "@/lib/admin/cms-date";

export interface PlainRole {
  _id: string;
  roleTitle: string;
  organization: string;
  category: RoleCategory;
  location?: string;
  startDate?: string;
  startDatePrecision?: DatePrecision;
  endDate?: string;
  endDatePrecision?: DatePrecision;
  isCurrent?: boolean;
  dateRangeText: string;
  hasStartDate: boolean;
  hasEndDate: boolean;
  summary: string;
  description?: string;
  highlights: string[];
  metrics?: Array<{ label: string; value: string; numericValue?: number; unit?: string; context?: string }>;
  skillIds: string[];
  skills: ResolvedChipItem[];
  featured: boolean;
  displayOrder: number;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export async function getCanonicalRoles(): Promise<{
  roles: PlainRole[];
  unresolvedSkillRefs: number;
}> {
  await connectDB();

  const roleDocs = await RoleModel.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean<IRole[]>();

  // Collect all unique skill ObjectIds across roles
  const allSkillIds = Array.from(
    new Set(
      roleDocs
        .flatMap((r) => r.skillIds ?? [])
        .map((id) => String(id))
    )
  );

  const skillDocs = await SkillModel.find({ _id: { $in: allSkillIds } })
    .select("name")
    .lean<ISkill[]>();

  const skillMap = new Map<string, string>();
  for (const s of skillDocs) {
    skillMap.set(String(s._id), s.name);
  }

  let unresolvedSkillRefs = 0;

  const roles: PlainRole[] = roleDocs.map((doc) => {
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
      doc.isCurrent
    );

    return {
      _id: String(doc._id),
      roleTitle: doc.roleTitle,
      organization: doc.organization,
      category: doc.category,
      location: doc.location,
      startDate: doc.startDate ? new Date(doc.startDate).toISOString() : undefined,
      startDatePrecision: doc.startDatePrecision,
      endDate: doc.endDate ? new Date(doc.endDate).toISOString() : undefined,
      endDatePrecision: doc.endDatePrecision,
      isCurrent: doc.isCurrent ?? false,
      dateRangeText: dateResult.formatted,
      hasStartDate: dateResult.hasStartDate,
      hasEndDate: dateResult.hasEndDate,
      summary: doc.summary,
      description: doc.description,
      highlights: doc.highlights ?? [],
      metrics: doc.metrics?.map((m) => ({
        label: m.label,
        value: m.value,
        numericValue: m.numericValue,
        unit: m.unit,
        context: m.context,
      })),
      skillIds: (doc.skillIds ?? []).map((id) => String(id)),
      skills: resolvedSkills,
      featured: doc.featured ?? false,
      displayOrder: doc.displayOrder ?? 0,
      publicationStatus: doc.publicationStatus,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
    };
  });

  return { roles, unresolvedSkillRefs };
}
