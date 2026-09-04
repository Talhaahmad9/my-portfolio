import { connectDB } from "@/lib/db/mongo";
import { RoleModel, IRole } from "@/lib/db/models/Role";
import { EducationModel, IEducation } from "@/lib/db/models/Education";
import { DatePrecision } from "@/lib/cms/types";
import { Types } from "mongoose";

export interface PublicRole {
  id: string;
  roleTitle: string;
  organization: string;
  category: string;
  location?: string;
  summary: string;
  periodText: string;
  startDate?: string;
  startDatePrecision?: DatePrecision;
  endDate?: string;
  endDatePrecision?: DatePrecision;
  isCurrent: boolean;
  highlights: string[];
}

export interface PublicEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  periodText: string;
  startDate?: string;
  startDatePrecision?: DatePrecision;
  endDate?: string;
  endDatePrecision?: DatePrecision;
  isCurrent: boolean;
  summary?: string;
  highlights: string[];
}

export interface PublicExperienceData {
  roles: PublicRole[];
  education: PublicEducation[];
}

/**
 * Truthfully formats a date according to its stored precision.
 */
function formatDateByPrecision(dateStr?: string | Date, precision?: DatePrecision): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  if (precision === "year") {
    return String(date.getUTCFullYear());
  }
  if (precision === "month") {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/**
 * Formats period text for a Role or Education record truthfully without guessing missing dates.
 */
export function formatRolePeriodText(
  startDate?: string | Date,
  startDatePrecision?: DatePrecision,
  endDate?: string | Date,
  endDatePrecision?: DatePrecision,
  isCurrent?: boolean
): string {
  const startStr = formatDateByPrecision(startDate, startDatePrecision);
  const endStr = formatDateByPrecision(endDate, endDatePrecision);

  if (startStr && endStr) {
    return `${startStr} – ${endStr}`;
  }

  if (startStr && isCurrent) {
    return `${startStr} – Present`;
  }

  if (startStr) {
    return startStr;
  }

  if (isCurrent && endStr) {
    return endDatePrecision === "year" ? `Expected ${endStr}` : `Present · ${endStr}`;
  }

  if (endStr) {
    return endDatePrecision === "year" ? `Expected ${endStr}` : endStr;
  }

  if (isCurrent) {
    return "Current";
  }

  return "";
}

/**
 * Fetches canonical published Role and Education records for the public Experience section.
 */
export async function getPublicExperienceForPublic(): Promise<PublicExperienceData> {
  await connectDB();

  const [roleDocs, educationDocs] = await Promise.all([
    RoleModel.find({ publicationStatus: "published" })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean() as unknown as Promise<(IRole & { _id: Types.ObjectId })[]>,
    EducationModel.find({ publicationStatus: "published" })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean() as unknown as Promise<(IEducation & { _id: Types.ObjectId })[]>,
  ]);

  const roles: PublicRole[] = roleDocs.map((r) => {
    const periodText = formatRolePeriodText(
      r.startDate,
      r.startDatePrecision,
      r.endDate,
      r.endDatePrecision,
      r.isCurrent
    );

    return {
      id: r._id.toString(),
      roleTitle: r.roleTitle,
      organization: r.organization,
      category: r.category,
      location: r.location || undefined,
      summary: r.summary,
      periodText,
      startDate: r.startDate ? new Date(r.startDate).toISOString() : undefined,
      startDatePrecision: r.startDatePrecision || undefined,
      endDate: r.endDate ? new Date(r.endDate).toISOString() : undefined,
      endDatePrecision: r.endDatePrecision || undefined,
      isCurrent: Boolean(r.isCurrent),
      highlights: r.highlights || [],
    };
  });

  const education: PublicEducation[] = educationDocs.map((e) => {
    const periodText = formatRolePeriodText(
      e.startDate,
      e.startDatePrecision,
      e.endDate,
      e.endDatePrecision,
      e.isCurrent
    );

    return {
      id: e._id.toString(),
      institution: e.institution,
      degree: e.degree,
      field: e.field || undefined,
      location: e.location || undefined,
      periodText,
      startDate: e.startDate ? new Date(e.startDate).toISOString() : undefined,
      startDatePrecision: e.startDatePrecision || undefined,
      endDate: e.endDate ? new Date(e.endDate).toISOString() : undefined,
      endDatePrecision: e.endDatePrecision || undefined,
      isCurrent: Boolean(e.isCurrent),
      summary: e.summary || undefined,
      highlights: e.highlights || [],
    };
  });

  return { roles, education };
}
