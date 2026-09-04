"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongo";
import { requireAdmin } from "@/lib/admin/require-admin";
import { RoleModel, IRole } from "@/lib/db/models/Role";
import { SkillModel } from "@/lib/db/models/Skill";
import { ProjectModel } from "@/lib/db/models/Project";
import { EventModel } from "@/lib/db/models/Event";
import { DatePrecision, RoleCategory } from "@/lib/cms/types";
import { parseAndNormalizeCmsDate, validateDateRange } from "@/lib/admin/cms-date-input";
import { getCanonicalRoles, PlainRole } from "@/lib/admin/queries/roles";

// ─── Interfaces & Validation Schemas ─────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
  dependencies?: {
    projects?: Array<{ id: string; title: string }>;
    events?: Array<{ id: string; title: string }>;
  };
}

const ROLE_CATEGORIES: RoleCategory[] = ["professional", "freelance", "leadership", "community"];

const metricSchema = z.object({
  label: z.string().trim().min(1, "Metric label is required"),
  value: z.string().trim().min(1, "Metric value is required"),
  change: z.string().trim().optional(),
});

export const createRoleSchema = z.object({
  roleTitle: z.string().trim().min(1, "Role title is required").max(120, "Role title is too long"),
  organization: z.string().trim().min(1, "Organization is required").max(120, "Organization name is too long"),
  category: z.enum(ROLE_CATEGORIES as [RoleCategory, ...RoleCategory[]]),
  location: z.string().trim().max(100, "Location is too long").optional(),
  startDateRaw: z.string().optional(),
  startDatePrecision: z.enum(["day", "month", "year"]).optional(),
  endDateRaw: z.string().optional(),
  endDatePrecision: z.enum(["day", "month", "year"]).optional(),
  isCurrent: z.boolean().default(false),
  summary: z.string().trim().min(1, "Summary is required").max(1000, "Summary is too long"),
  description: z.string().trim().max(3000, "Description is too long").optional(),
  highlights: z.array(z.string().trim()).default([]),
  metrics: z.array(metricSchema).default([]),
  skillIds: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  publicationStatus: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updateRoleSchema = z.object({
  id: z.string().min(1, "Role ID is required"),
  roleTitle: z.string().trim().min(1, "Role title cannot be empty").max(120, "Role title is too long").optional(),
  organization: z.string().trim().min(1, "Organization cannot be empty").max(120, "Organization is too long").optional(),
  category: z.enum(ROLE_CATEGORIES as [RoleCategory, ...RoleCategory[]]).optional(),
  location: z.string().trim().max(100, "Location is too long").optional(),
  startDateRaw: z.string().optional(),
  startDatePrecision: z.enum(["day", "month", "year"]).optional(),
  endDateRaw: z.string().optional(),
  endDatePrecision: z.enum(["day", "month", "year"]).optional(),
  isCurrent: z.boolean().optional(),
  summary: z.string().trim().min(1, "Summary cannot be empty").max(1000, "Summary is too long").optional(),
  description: z.string().trim().max(3000, "Description is too long").optional(),
  highlights: z.array(z.string().trim()).optional(),
  metrics: z.array(metricSchema).optional(),
  skillIds: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

function revalidateRoleRoutes() {
  revalidatePath("/");
  revalidatePath("/cv");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/experience");
  revalidatePath("/admin/dashboard/experience/roles");
  revalidatePath("/admin/dashboard/projects");
  revalidatePath("/admin/dashboard/events");
}

/**
 * Validates and deduplicates an array of submitted Skill ObjectIds.
 * Ensures all requested skill IDs exist in the Skill collection.
 */
async function validateSkillIds(rawIds: string[]): Promise<{ validIds: mongoose.Types.ObjectId[]; error?: string }> {
  if (!rawIds || rawIds.length === 0) {
    return { validIds: [] };
  }

  const cleanIds = Array.from(new Set(rawIds.filter((id) => id && id.trim())));
  for (const id of cleanIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { validIds: [], error: `Invalid Skill ID syntax: "${id}"` };
    }
  }

  const objectIds = cleanIds.map((id) => new mongoose.Types.ObjectId(id));
  const count = await SkillModel.countDocuments({ _id: { $in: objectIds } });
  if (count !== objectIds.length) {
    return { validIds: [], error: `One or more requested Skill IDs do not exist in the database.` };
  }

  return { validIds: objectIds };
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Creates a new canonical Role document.
 */
export async function createRole(input: CreateRoleInput): Promise<ActionResult<PlainRole>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = createRoleSchema.parse(input);

    // Normalize start and end dates
    const startNorm = parseAndNormalizeCmsDate(parsed.startDateRaw, parsed.startDatePrecision);
    const endNorm = parseAndNormalizeCmsDate(parsed.endDateRaw, parsed.endDatePrecision);

    // Role invariant: Current roles cannot have an end date
    if (parsed.isCurrent && (endNorm.date || parsed.endDateRaw)) {
      return { success: false, error: "Current roles cannot have an end date. Please clear end date or uncheck 'Current Role'." };
    }

    // Date range sanity check
    if (startNorm.date && endNorm.date && !validateDateRange(startNorm.date, endNorm.date)) {
      return { success: false, error: "End date must be greater than or equal to start date." };
    }

    // Validate skillIds
    const skillCheck = await validateSkillIds(parsed.skillIds);
    if (skillCheck.error) {
      return { success: false, error: skillCheck.error };
    }

    // Clean highlights
    const cleanHighlights = parsed.highlights.map((h) => h.trim()).filter((h) => h.length > 0);

    // Clean metrics (preserving "0" values)
    const cleanMetrics = parsed.metrics.map((m) => ({
      label: m.label.trim(),
      value: m.value.trim(),
      change: m.change ? m.change.trim() : undefined,
    }));

    const created = await RoleModel.create({
      roleTitle: parsed.roleTitle,
      organization: parsed.organization,
      category: parsed.category,
      location: parsed.location || undefined,
      startDate: startNorm.date || undefined,
      startDatePrecision: startNorm.precision || undefined,
      endDate: parsed.isCurrent ? undefined : endNorm.date || undefined,
      endDatePrecision: parsed.isCurrent ? undefined : endNorm.precision || undefined,
      isCurrent: parsed.isCurrent,
      summary: parsed.summary,
      description: parsed.description || undefined,
      highlights: cleanHighlights,
      metrics: cleanMetrics,
      skillIds: skillCheck.validIds,
      featured: parsed.featured,
      displayOrder: parsed.displayOrder,
      publicationStatus: parsed.publicationStatus,
    });

    revalidateRoleRoutes();

    // Query canonical roles list to return clean plain representation
    const { roles } = await getCanonicalRoles();
    const plainRole = roles.find((r) => r._id === String(created._id));

    return {
      success: true,
      data: plainRole,
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to create Role.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing canonical Role document with narrow $set / $unset operations.
 */
export async function updateRole(input: UpdateRoleInput): Promise<ActionResult<PlainRole>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = updateRoleSchema.parse(input);

    const existing = await RoleModel.findById(parsed.id);
    if (!existing) {
      return { success: false, error: "Role not found." };
    }

    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, unknown> = {};

    if (parsed.roleTitle !== undefined) setFields.roleTitle = parsed.roleTitle;
    if (parsed.organization !== undefined) setFields.organization = parsed.organization;
    if (parsed.category !== undefined) setFields.category = parsed.category;
    if (parsed.summary !== undefined) setFields.summary = parsed.summary;
    if (parsed.featured !== undefined) setFields.featured = parsed.featured;
    if (parsed.displayOrder !== undefined) setFields.displayOrder = parsed.displayOrder;
    if (parsed.publicationStatus !== undefined) setFields.publicationStatus = parsed.publicationStatus;

    // Optional string fields
    if (parsed.location === "") unsetFields.location = 1;
    else if (parsed.location !== undefined) setFields.location = parsed.location;

    if (parsed.description === "") unsetFields.description = 1;
    else if (parsed.description !== undefined) setFields.description = parsed.description;

    // Highlights
    if (parsed.highlights !== undefined) {
      setFields.highlights = parsed.highlights.map((h) => h.trim()).filter((h) => h.length > 0);
    }

    // Metrics
    if (parsed.metrics !== undefined) {
      setFields.metrics = parsed.metrics.map((m) => ({
        label: m.label.trim(),
        value: m.value.trim(),
        change: m.change ? m.change.trim() : undefined,
      }));
    }

    // Skill relationships
    if (parsed.skillIds !== undefined) {
      const skillCheck = await validateSkillIds(parsed.skillIds);
      if (skillCheck.error) {
        return { success: false, error: skillCheck.error };
      }
      setFields.skillIds = skillCheck.validIds;
    }

    // Role invariant: Contradictory payload (isCurrent: true AND endDate explicitly provided)
    if (parsed.isCurrent === true && (parsed.endDateRaw || parsed.endDatePrecision)) {
      return {
        success: false,
        error: "Current roles cannot have an end date. Please clear end date or uncheck 'Current Role'.",
      };
    }

    // Handle isCurrent & Date/Precision transitions
    const effectiveIsCurrent = parsed.isCurrent !== undefined ? parsed.isCurrent : existing.isCurrent;
    if (parsed.isCurrent !== undefined) {
      setFields.isCurrent = parsed.isCurrent;
    }

    if (effectiveIsCurrent) {
      // Current role invariant: clear end date and precision atomically
      unsetFields.endDate = 1;
      unsetFields.endDatePrecision = 1;
    } else if (parsed.endDateRaw !== undefined || parsed.endDatePrecision !== undefined) {
      const endNorm = parseAndNormalizeCmsDate(parsed.endDateRaw, parsed.endDatePrecision);
      if (endNorm.date && endNorm.precision) {
        setFields.endDate = endNorm.date;
        setFields.endDatePrecision = endNorm.precision;
      } else {
        unsetFields.endDate = 1;
        unsetFields.endDatePrecision = 1;
      }
    }

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

    const candidateEnd: Date | undefined = effectiveIsCurrent || unsetFields.endDate
      ? undefined
      : setFields.endDate !== undefined
      ? (setFields.endDate as Date)
      : existing.endDate;

    const candidateEndPrec: DatePrecision | undefined = effectiveIsCurrent || unsetFields.endDatePrecision
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
      const { roles } = await getCanonicalRoles();
      return { success: true, data: roles.find((r) => r._id === parsed.id) };
    }

    const updated = await RoleModel.findByIdAndUpdate(parsed.id, updateQuery, {
      new: true,
      runValidators: true,
    }).lean<IRole>();

    if (!updated) {
      return { success: false, error: "Role not found after update attempt." };
    }

    revalidateRoleRoutes();

    const { roles } = await getCanonicalRoles();
    const plainRole = roles.find((r) => r._id === parsed.id);

    return {
      success: true,
      data: plainRole,
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to update Role.";
    return { success: false, error: message };
  }
}

/**
 * Sets a Role's publicationStatus to "archived". Retains document and graph relationships.
 */
export async function archiveRole(id: string): Promise<ActionResult<PlainRole>> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string") {
      return { success: false, error: "Role ID is required." };
    }

    const existing = await RoleModel.findById(id);
    if (!existing) {
      return { success: false, error: "Role not found." };
    }

    const updated = await RoleModel.findByIdAndUpdate(
      id,
      { $set: { publicationStatus: "archived" } },
      { new: true, runValidators: true }
    ).lean<IRole>();

    if (!updated) {
      return { success: false, error: "Failed to archive Role." };
    }

    revalidateRoleRoutes();

    const { roles } = await getCanonicalRoles();
    const plainRole = roles.find((r) => r._id === id);

    return {
      success: true,
      data: plainRole,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to archive Role.";
    return { success: false, error: message };
  }
}

/**
 * Hard deletes a Role document ONLY if zero incoming references exist.
 * Uses a Mongoose transaction to ensure session-scoped dependency authorization.
 */
export async function deleteRole(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Valid Role ID is required." };
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const roleObjectId = new mongoose.Types.ObjectId(id);

      const role = await RoleModel.findById(id).session(session).lean<IRole>();
      if (!role) {
        await session.abortTransaction();
        return { success: false, error: "Role not found." };
      }

      // Check incoming references across Projects and Events
      const [projects, events] = await Promise.all([
        ProjectModel.find({ roleIds: roleObjectId }).select("title").session(session).lean(),
        EventModel.find({ roleIds: roleObjectId }).select("title").session(session).lean(),
      ]);

      const hasReferences = projects.length > 0 || events.length > 0;

      if (hasReferences) {
        await session.abortTransaction();

        const depParts: string[] = [];
        if (projects.length > 0) {
          depParts.push(`${projects.length} Project(s) (${projects.map((p) => p.title).join(", ")})`);
        }
        if (events.length > 0) {
          depParts.push(`${events.length} Event(s) (${events.map((e) => e.title).join(", ")})`);
        }

        return {
          success: false,
          error: `Cannot delete Role "${role.roleTitle} @ ${role.organization}". It is referenced by: ${depParts.join("; ")}. Please use Archive instead.`,
          dependencies: {
            projects: projects.map((p) => ({ id: String(p._id), title: p.title })),
            events: events.map((e) => ({ id: String(e._id), title: e.title })),
          },
        };
      }

      const deleteRes = await RoleModel.deleteOne({ _id: id }).session(session);

      if (deleteRes.deletedCount !== 1) {
        await session.abortTransaction();
        return { success: false, error: "Failed to verify Role deletion count." };
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

    revalidateRoleRoutes();

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete Role.";
    return { success: false, error: message };
  }
}
