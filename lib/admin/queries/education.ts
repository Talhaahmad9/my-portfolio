import { connectDB } from "@/lib/db/mongo";
import { EducationModel, IEducation } from "@/lib/db/models/Education";
import { DatePrecision, PublicationStatus } from "@/lib/cms/types";
import { formatCmsDateRange } from "@/lib/admin/cms-date";

export interface PlainEducation {
  _id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  startDatePrecision?: DatePrecision;
  endDate?: string;
  endDatePrecision?: DatePrecision;
  isCurrent?: boolean;
  dateRangeText: string;
  hasStartDate: boolean;
  hasEndDate: boolean;
  summary?: string;
  highlights: string[];
  displayOrder: number;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export async function getCanonicalEducation(): Promise<PlainEducation[]> {
  await connectDB();

  const docs = await EducationModel.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean<IEducation[]>();

  return docs.map((doc) => {
    const dateResult = formatCmsDateRange(
      doc.startDate,
      doc.startDatePrecision,
      doc.endDate,
      doc.endDatePrecision,
      doc.isCurrent
    );

    return {
      _id: String(doc._id),
      institution: doc.institution,
      degree: doc.degree,
      field: doc.field,
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
      highlights: doc.highlights ?? [],
      displayOrder: doc.displayOrder ?? 0,
      publicationStatus: doc.publicationStatus,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
    };
  });
}
