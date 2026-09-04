"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongo";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AwardModel, IAward } from "@/lib/db/models/Award";
import { ProjectModel } from "@/lib/db/models/Project";
import { EventModel } from "@/lib/db/models/Event";
import { SkillModel } from "@/lib/db/models/Skill";
import { AwardType } from "@/lib/cms/types";
import { getCanonicalAwards, PlainAward } from "@/lib/admin/queries/achievements";

// ─── Interfaces & Schemas ────────────────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

const AWARD_TYPES: AwardType[] = [
  "competition",
  "recognition",
  "academic",
  "other",
];

const metricSchema = z.object({
  label: z.string().trim().min(1, "Metric label is required"),
  value: z.string().trim().min(1, "Metric value is required"),
  numericValue: z.number().optional(),
  unit: z.string().trim().optional(),
  context: z.string().trim().optional(),
  displayOrder: z.number().int().optional(),
});

export const createAwardSchema = z.object({
  title: z.string().trim().min(1, "Award title is required").max(150, "Title is too long"),
  awardType: z.enum(AWARD_TYPES as [AwardType, ...AwardType[]]),
  issuer: z.string().trim().max(100, "Issuer is too long").optional(),
  placement: z.string().trim().max(100, "Placement is too long").optional(),
  score: z.string().trim().max(100, "Score is too long").optional(),
  dateRaw: z.string().min(1, "Award date is required"),
  summary: z.string().trim().max(1000, "Summary is too long").optional(),
  description: z.string().trim().max(3000, "Description is too long").optional(),
  metrics: z.array(metricSchema).default([]),
  relatedProjectId: z.string().optional().nullable(),
  relatedEventId: z.string().optional().nullable(),
  skillIds: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  publicationStatus: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updateAwardSchema = z.object({
  id: z.string().min(1, "Award ID is required"),
  title: z.string().trim().min(1, "Award title cannot be empty").max(150, "Title is too long").optional(),
  awardType: z.enum(AWARD_TYPES as [AwardType, ...AwardType[]]).optional(),
  issuer: z.string().trim().max(100, "Issuer is too long").optional(),
  placement: z.string().trim().max(100, "Placement is too long").optional(),
  score: z.string().trim().max(100, "Score is too long").optional(),
  dateRaw: z.string().optional(),
  summary: z.string().trim().max(1000, "Summary is too long").optional(),
  description: z.string().trim().max(3000, "Description is too long").optional(),
  metrics: z.array(metricSchema).optional(),
  relatedProjectId: z.string().optional().nullable(),
  relatedEventId: z.string().optional().nullable(),
  skillIds: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
});

export type CreateAwardInput = z.infer<typeof createAwardSchema>;
export type UpdateAwardInput = z.infer<typeof updateAwardSchema>;

function revalidateAwardRoutes() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/achievements");
  revalidatePath("/admin/dashboard/achievements/awards");
  revalidatePath("/");
  revalidatePath("/cv");
}

// ─── Exact Day Date Normalization ─────────────────────────────────────────────

function parseExactAwardDay(dateRaw?: string | null): { date?: Date; error?: string } {
  if (!dateRaw || !dateRaw.trim()) {
    return {};
  }

  const trimmed = dateRaw.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return {
      error: "Exact award date (YYYY-MM-DD) is required. Partial dates (e.g. month-only or year-only) are not supported.",
    };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(date.getTime())) {
    return { error: "Invalid date value." };
  }

  return { date };
}

// ─── Singular Ref Validation Helper ──────────────────────────────────────────

async function validateSingularRef(
  idString: string | null | undefined,
  model: typeof ProjectModel | typeof EventModel,
  modelName: string
): Promise<{ objectId?: mongoose.Types.ObjectId; clear: boolean; error?: string }> {
  if (idString === undefined) {
    return { clear: false };
  }

  if (idString === null || idString.trim() === "") {
    return { clear: true };
  }

  const clean = idString.trim();
  if (!mongoose.Types.ObjectId.isValid(clean)) {
    return { clear: false, error: `Invalid ${modelName} ID syntax: "${clean}"` };
  }

  const count = await (model as unknown as mongoose.Model<mongoose.Document>).countDocuments({ _id: clean });
  if (count === 0) {
    return { clear: false, error: `Referenced ${modelName} ID "${clean}" does not exist.` };
  }

  return { objectId: new mongoose.Types.ObjectId(clean), clear: false };
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Creates a new canonical Award document.
 */
export async function createAward(input: CreateAwardInput): Promise<ActionResult<PlainAward>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = createAwardSchema.parse(input);

    const dateResult = parseExactAwardDay(parsed.dateRaw);
    if (dateResult.error || !dateResult.date) {
      return { success: false, error: dateResult.error || "Award date is required." };
    }

    const [projectRes, eventRes] = await Promise.all([
      validateSingularRef(parsed.relatedProjectId, ProjectModel, "Project"),
      validateSingularRef(parsed.relatedEventId, EventModel, "Event"),
    ]);

    if (projectRes.error) return { success: false, error: projectRes.error };
    if (eventRes.error) return { success: false, error: eventRes.error };

    let validSkillIds: mongoose.Types.ObjectId[] = [];
    if (parsed.skillIds && parsed.skillIds.length > 0) {
      const cleanSkills = Array.from(new Set(parsed.skillIds.filter((s) => s && s.trim())));
      for (const sId of cleanSkills) {
        if (!mongoose.Types.ObjectId.isValid(sId)) {
          return { success: false, error: `Invalid Skill ID syntax: "${sId}"` };
        }
      }
      const objectIds = cleanSkills.map((id) => new mongoose.Types.ObjectId(id));
      const count = await SkillModel.countDocuments({ _id: { $in: objectIds } });
      if (count !== objectIds.length) {
        return { success: false, error: "One or more requested Skill IDs do not exist in the database." };
      }
      validSkillIds = objectIds;
    }

    const created = await AwardModel.create({
      title: parsed.title,
      awardType: parsed.awardType,
      issuer: parsed.issuer || undefined,
      placement: parsed.placement || undefined,
      score: parsed.score || undefined,
      date: dateResult.date,
      summary: parsed.summary || undefined,
      description: parsed.description || undefined,
      metrics: parsed.metrics,
      relatedProjectId: projectRes.objectId,
      relatedEventId: eventRes.objectId,
      skillIds: validSkillIds,
      featured: parsed.featured,
      displayOrder: parsed.displayOrder,
      publicationStatus: parsed.publicationStatus,
    });

    revalidateAwardRoutes();

    const { awards } = await getCanonicalAwards();
    const plainAward = awards.find((a) => a._id === String(created._id));

    return { success: true, data: plainAward };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to create Award.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing canonical Award document with narrow $set / $unset operations.
 */
export async function updateAward(input: UpdateAwardInput): Promise<ActionResult<PlainAward>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = updateAwardSchema.parse(input);

    const existing = await AwardModel.findById(parsed.id);
    if (!existing) {
      return { success: false, error: "Award record not found." };
    }

    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, unknown> = {};

    if (parsed.title !== undefined) setFields.title = parsed.title;
    if (parsed.awardType !== undefined) setFields.awardType = parsed.awardType;
    if (parsed.featured !== undefined) setFields.featured = parsed.featured;
    if (parsed.displayOrder !== undefined) setFields.displayOrder = parsed.displayOrder;
    if (parsed.publicationStatus !== undefined) setFields.publicationStatus = parsed.publicationStatus;

    if (parsed.issuer === "") unsetFields.issuer = 1;
    else if (parsed.issuer !== undefined) setFields.issuer = parsed.issuer;

    if (parsed.placement === "") unsetFields.placement = 1;
    else if (parsed.placement !== undefined) setFields.placement = parsed.placement;

    if (parsed.score === "") unsetFields.score = 1;
    else if (parsed.score !== undefined) setFields.score = parsed.score;

    if (parsed.summary === "") unsetFields.summary = 1;
    else if (parsed.summary !== undefined) setFields.summary = parsed.summary;

    if (parsed.description === "") unsetFields.description = 1;
    else if (parsed.description !== undefined) setFields.description = parsed.description;

    if (parsed.metrics !== undefined) setFields.metrics = parsed.metrics;

    // Date contract
    if (parsed.dateRaw !== undefined) {
      const dateResult = parseExactAwardDay(parsed.dateRaw);
      if (dateResult.error || !dateResult.date) {
        return { success: false, error: dateResult.error || "Award date cannot be cleared." };
      }
      setFields.date = dateResult.date;
    }

    // Singular ref contracts
    if (parsed.relatedProjectId !== undefined) {
      const projectRes = await validateSingularRef(parsed.relatedProjectId, ProjectModel, "Project");
      if (projectRes.error) return { success: false, error: projectRes.error };
      if (projectRes.clear) unsetFields.relatedProjectId = 1;
      else if (projectRes.objectId) setFields.relatedProjectId = projectRes.objectId;
    }

    if (parsed.relatedEventId !== undefined) {
      const eventRes = await validateSingularRef(parsed.relatedEventId, EventModel, "Event");
      if (eventRes.error) return { success: false, error: eventRes.error };
      if (eventRes.clear) unsetFields.relatedEventId = 1;
      else if (eventRes.objectId) setFields.relatedEventId = eventRes.objectId;
    }

    // Skill array contract
    if (parsed.skillIds !== undefined) {
      const cleanSkills = Array.from(new Set(parsed.skillIds.filter((s) => s && s.trim())));
      for (const sId of cleanSkills) {
        if (!mongoose.Types.ObjectId.isValid(sId)) {
          return { success: false, error: `Invalid Skill ID syntax: "${sId}"` };
        }
      }
      const objectIds = cleanSkills.map((id) => new mongoose.Types.ObjectId(id));
      if (objectIds.length > 0) {
        const count = await SkillModel.countDocuments({ _id: { $in: objectIds } });
        if (count !== objectIds.length) {
          return { success: false, error: "One or more requested Skill IDs do not exist in the database." };
        }
      }
      setFields.skillIds = objectIds;
    }

    const updateQuery: Record<string, unknown> = {};
    if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;
    if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

    if (Object.keys(updateQuery).length === 0) {
      const { awards } = await getCanonicalAwards();
      return { success: true, data: awards.find((a) => a._id === parsed.id) };
    }

    const updated = await AwardModel.findByIdAndUpdate(parsed.id, updateQuery, {
      new: true,
      runValidators: true,
    }).lean<IAward>();

    if (!updated) {
      return { success: false, error: "Award not found after update attempt." };
    }

    revalidateAwardRoutes();

    const { awards } = await getCanonicalAwards();
    const plainAward = awards.find((a) => a._id === parsed.id);

    return { success: true, data: plainAward };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to update Award.";
    return { success: false, error: message };
  }
}

/**
 * Sets an Award's publicationStatus to "archived". Retains document and relationships.
 */
export async function archiveAward(id: string): Promise<ActionResult<PlainAward>> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string") {
      return { success: false, error: "Award ID is required." };
    }

    const existing = await AwardModel.findById(id);
    if (!existing) {
      return { success: false, error: "Award record not found." };
    }

    const updated = await AwardModel.findByIdAndUpdate(
      id,
      { $set: { publicationStatus: "archived" } },
      { new: true, runValidators: true }
    ).lean<IAward>();

    if (!updated) {
      return { success: false, error: "Failed to archive Award." };
    }

    revalidateAwardRoutes();

    const { awards } = await getCanonicalAwards();
    const plainAward = awards.find((a) => a._id === id);

    return { success: true, data: plainAward };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to archive Award.";
    return { success: false, error: message };
  }
}

/**
 * Hard deletes an Award document inside a session transaction.
 * Award is a leaf node in the graph, so zero incoming references exist.
 */
export async function deleteAward(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Valid Award ID is required." };
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const award = await AwardModel.findById(id).session(session).lean<IAward>();
      if (!award) {
        await session.abortTransaction();
        return { success: false, error: "Award record not found." };
      }

      const deleteRes = await AwardModel.deleteOne({ _id: id }).session(session);

      if (deleteRes.deletedCount !== 1) {
        await session.abortTransaction();
        return { success: false, error: "Failed to verify Award deletion count." };
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

    revalidateAwardRoutes();

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete Award.";
    return { success: false, error: message };
  }
}
