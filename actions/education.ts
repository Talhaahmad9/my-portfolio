"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongo";
import { requireAdmin } from "@/lib/admin/require-admin";
import { EducationModel, IEducation } from "@/lib/db/models/Education";
import { DatePrecision } from "@/lib/cms/types";
import { parseAndNormalizeCmsDate, validateDateRange } from "@/lib/admin/cms-date-input";
import { getCanonicalEducation, PlainEducation } from "@/lib/admin/queries/education";

// ─── Interfaces & Validation Schemas ─────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export const createEducationSchema = z.object({
  institution: z.string().trim().min(1, "Institution is required").max(150, "Institution name is too long"),
  degree: z.string().trim().min(1, "Degree is required").max(150, "Degree title is too long"),
  field: z.string().trim().max(150, "Field of study is too long").optional(),
  location: z.string().trim().max(100, "Location is too long").optional(),
  startDateRaw: z.string().optional(),
  startDatePrecision: z.enum(["day", "month", "year"]).optional(),
  endDateRaw: z.string().optional(),
  endDatePrecision: z.enum(["day", "month", "year"]).optional(),
  isCurrent: z.boolean().default(false),
  summary: z.string().trim().max(1000, "Summary is too long").optional(),
  highlights: z.array(z.string().trim()).default([]),
  displayOrder: z.number().int().default(0),
  publicationStatus: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updateEducationSchema = z.object({
  id: z.string().min(1, "Education ID is required"),
  institution: z.string().trim().min(1, "Institution cannot be empty").max(150, "Institution is too long").optional(),
  degree: z.string().trim().min(1, "Degree cannot be empty").max(150, "Degree is too long").optional(),
  field: z.string().trim().max(150, "Field of study is too long").optional(),
  location: z.string().trim().max(100, "Location is too long").optional(),
  startDateRaw: z.string().optional(),
  startDatePrecision: z.enum(["day", "month", "year"]).optional(),
  endDateRaw: z.string().optional(),
  endDatePrecision: z.enum(["day", "month", "year"]).optional(),
  isCurrent: z.boolean().optional(),
  summary: z.string().trim().max(1000, "Summary is too long").optional(),
  highlights: z.array(z.string().trim()).optional(),
  displayOrder: z.number().int().optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
});

export type CreateEducationInput = z.infer<typeof createEducationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;

function revalidateEducationRoutes() {
  revalidatePath("/");
  revalidatePath("/cv");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/experience");
  revalidatePath("/admin/dashboard/experience/education");
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Creates a new canonical Education document.
 */
export async function createEducation(input: CreateEducationInput): Promise<ActionResult<PlainEducation>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = createEducationSchema.parse(input);

    const startNorm = parseAndNormalizeCmsDate(parsed.startDateRaw, parsed.startDatePrecision);
    const endNorm = parseAndNormalizeCmsDate(parsed.endDateRaw, parsed.endDatePrecision);

    if (startNorm.date && endNorm.date && !validateDateRange(startNorm.date, endNorm.date)) {
      return { success: false, error: "End date must be greater than or equal to start date." };
    }

    const cleanHighlights = parsed.highlights.map((h) => h.trim()).filter((h) => h.length > 0);

    const created = await EducationModel.create({
      institution: parsed.institution,
      degree: parsed.degree,
      field: parsed.field || undefined,
      location: parsed.location || undefined,
      startDate: startNorm.date || undefined,
      startDatePrecision: startNorm.precision || undefined,
      endDate: endNorm.date || undefined,
      endDatePrecision: endNorm.precision || undefined,
      isCurrent: parsed.isCurrent,
      summary: parsed.summary || undefined,
      highlights: cleanHighlights,
      displayOrder: parsed.displayOrder,
      publicationStatus: parsed.publicationStatus,
    });

    revalidateEducationRoutes();

    const educationList = await getCanonicalEducation();
    const plainEd = educationList.find((e: PlainEducation) => e._id === String(created._id));

    return {
      success: true,
      data: plainEd,
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to create Education.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing canonical Education document with narrow $set / $unset operations.
 */
export async function updateEducation(input: UpdateEducationInput): Promise<ActionResult<PlainEducation>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = updateEducationSchema.parse(input);

    const existing = await EducationModel.findById(parsed.id);
    if (!existing) {
      return { success: false, error: "Education record not found." };
    }

    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, unknown> = {};

    if (parsed.institution !== undefined) setFields.institution = parsed.institution;
    if (parsed.degree !== undefined) setFields.degree = parsed.degree;
    if (parsed.displayOrder !== undefined) setFields.displayOrder = parsed.displayOrder;
    if (parsed.publicationStatus !== undefined) setFields.publicationStatus = parsed.publicationStatus;
    if (parsed.isCurrent !== undefined) setFields.isCurrent = parsed.isCurrent;

    // Optional string fields
    if (parsed.field === "") unsetFields.field = 1;
    else if (parsed.field !== undefined) setFields.field = parsed.field;

    if (parsed.location === "") unsetFields.location = 1;
    else if (parsed.location !== undefined) setFields.location = parsed.location;

    if (parsed.summary === "") unsetFields.summary = 1;
    else if (parsed.summary !== undefined) setFields.summary = parsed.summary;

    // Highlights
    if (parsed.highlights !== undefined) {
      setFields.highlights = parsed.highlights.map((h) => h.trim()).filter((h) => h.length > 0);
    }

    // Dates & Precision
    if (parsed.startDateRaw !== undefined || parsed.startDatePrecision !== undefined) {
      const startNorm = parseAndNormalizeCmsDate(parsed.startDateRaw, parsed.startDatePrecision);
      if (startNorm.date && startNorm.precision) {
        setFields.startDate = startNorm.date;
        setFields.startDatePrecision = startNorm.precision;
      } else {
        unsetFields.startDate = 1;
        unsetFields.startDatePrecision = 1;
      }
    }

    if (parsed.endDateRaw !== undefined || parsed.endDatePrecision !== undefined) {
      const endNorm = parseAndNormalizeCmsDate(parsed.endDateRaw, parsed.endDatePrecision);
      if (endNorm.date && endNorm.precision) {
        setFields.endDate = endNorm.date;
        setFields.endDatePrecision = endNorm.precision;
      } else {
        unsetFields.endDate = 1;
        unsetFields.endDatePrecision = 1;
      }
    }

    // Derive candidate future merged document state for dates & precisions
    const candidateStart: Date | undefined = unsetFields.startDate
      ? undefined
      : setFields.startDate !== undefined
      ? (setFields.startDate as Date)
      : existing.startDate;

    const candidateStartPrec: DatePrecision | undefined = unsetFields.startDatePrecision
      ? undefined
      : setFields.startDatePrecision !== undefined
      ? (setFields.startDatePrecision as DatePrecision)
      : existing.startDatePrecision;

    const candidateEnd: Date | undefined = unsetFields.endDate
      ? undefined
      : setFields.endDate !== undefined
      ? (setFields.endDate as Date)
      : existing.endDate;

    const candidateEndPrec: DatePrecision | undefined = unsetFields.endDatePrecision
      ? undefined
      : setFields.endDatePrecision !== undefined
      ? (setFields.endDatePrecision as DatePrecision)
      : existing.endDatePrecision;

    // Validate date/precision pair completeness on candidate state
    if (Boolean(candidateStart) !== Boolean(candidateStartPrec)) {
      return { success: false, error: "Start date and start date precision must both be present or both be cleared." };
    }

    if (Boolean(candidateEnd) !== Boolean(candidateEndPrec)) {
      return { success: false, error: "End date and end date precision must both be present or both be cleared." };
    }

    // Validate merged candidate date range
    if (candidateStart && candidateEnd && !validateDateRange(candidateStart, candidateEnd)) {
      return { success: false, error: "End date must be greater than or equal to start date." };
    }

    const updateQuery: Record<string, unknown> = {};
    if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;
    if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

    if (Object.keys(updateQuery).length === 0) {
      const educationList = await getCanonicalEducation();
      return { success: true, data: educationList.find((e: PlainEducation) => e._id === parsed.id) };
    }

    const updated = await EducationModel.findByIdAndUpdate(parsed.id, updateQuery, {
      new: true,
      runValidators: true,
    }).lean<IEducation>();

    if (!updated) {
      return { success: false, error: "Education record not found after update attempt." };
    }

    revalidateEducationRoutes();

    const educationList = await getCanonicalEducation();
    const plainEd = educationList.find((e: PlainEducation) => e._id === parsed.id);

    return {
      success: true,
      data: plainEd,
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to update Education.";
    return { success: false, error: message };
  }
}

/**
 * Sets an Education record's publicationStatus to "archived". Retains document.
 */
export async function archiveEducation(id: string): Promise<ActionResult<PlainEducation>> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string") {
      return { success: false, error: "Education ID is required." };
    }

    const existing = await EducationModel.findById(id);
    if (!existing) {
      return { success: false, error: "Education record not found." };
    }

    const updated = await EducationModel.findByIdAndUpdate(
      id,
      { $set: { publicationStatus: "archived" } },
      { new: true, runValidators: true }
    ).lean<IEducation>();

    if (!updated) {
      return { success: false, error: "Failed to archive Education record." };
    }

    revalidateEducationRoutes();

    const educationList = await getCanonicalEducation();
    const plainEd = educationList.find((e: PlainEducation) => e._id === id);

    return {
      success: true,
      data: plainEd,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to archive Education record.";
    return { success: false, error: message };
  }
}

/**
 * Hard deletes an Education record document using a session-scoped transaction.
 * (Education is a graph leaf with zero incoming references in canonical CMS).
 */
export async function deleteEducation(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Valid Education ID is required." };
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const ed = await EducationModel.findById(id).session(session).lean<IEducation>();
      if (!ed) {
        await session.abortTransaction();
        return { success: false, error: "Education record not found." };
      }

      const deleteRes = await EducationModel.deleteOne({ _id: id }).session(session);

      if (deleteRes.deletedCount !== 1) {
        await session.abortTransaction();
        return { success: false, error: "Failed to verify Education deletion count." };
      }

      await session.commitTransaction();
    } catch (txErr: unknown) {
      await session.abortTransaction();
      const txMsg = txErr instanceof Error ? txErr.message : "Database transaction error";
      return {
        success: false,
        error: `Transaction failed during deletion: ${txMsg}. Hard delete aborted.`,
      };
    } finally {
      session.endSession();
    }

    revalidateEducationRoutes();

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete Education record.";
    return { success: false, error: message };
  }
}
