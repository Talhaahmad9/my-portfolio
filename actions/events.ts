"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongo";
import { requireAdmin } from "@/lib/admin/require-admin";
import { EventModel, IEvent } from "@/lib/db/models/Event";
import { ProjectModel } from "@/lib/db/models/Project";
import { RoleModel } from "@/lib/db/models/Role";
import { SkillModel } from "@/lib/db/models/Skill";
import { AwardModel } from "@/lib/db/models/Award";
import { DatePrecision, EventType } from "@/lib/cms/types";
import { parseAndNormalizeCmsDate, validateDateRange } from "@/lib/admin/cms-date-input";
import { getCanonicalEvents, PlainEvent } from "@/lib/admin/queries/events";

// ─── Interfaces & Schemas ────────────────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
  dependencies?: {
    awards?: Array<{ id: string; title: string }>;
  };
}

const EVENT_TYPES: EventType[] = [
  "hackathon",
  "competition",
  "workshop",
  "webinar",
  "conference",
  "community",
  "other",
];

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "Event title is required").max(150, "Title is too long"),
  eventType: z.enum(EVENT_TYPES as [EventType, ...EventType[]]),
  organizer: z.string().trim().max(100, "Organizer name is too long").optional(),
  startDateRaw: z.string().min(1, "Start date is required"),
  startDatePrecision: z.enum(["day", "month", "year"]),
  endDateRaw: z.string().optional(),
  endDatePrecision: z.enum(["day", "month", "year"]).optional(),
  location: z.string().trim().max(100, "Location is too long").optional(),
  summary: z.string().trim().max(1000, "Summary is too long").optional(),
  highlights: z.array(z.string().trim()).default([]),
  projectIds: z.array(z.string()).default([]),
  roleIds: z.array(z.string()).default([]),
  skillIds: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  publicationStatus: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updateEventSchema = z.object({
  id: z.string().min(1, "Event ID is required"),
  title: z.string().trim().min(1, "Event title cannot be empty").max(150, "Title is too long").optional(),
  eventType: z.enum(EVENT_TYPES as [EventType, ...EventType[]]).optional(),
  organizer: z.string().trim().max(100, "Organizer name is too long").optional(),
  startDateRaw: z.string().optional(),
  startDatePrecision: z.enum(["day", "month", "year"]).optional(),
  endDateRaw: z.string().optional(),
  endDatePrecision: z.enum(["day", "month", "year"]).optional(),
  location: z.string().trim().max(100, "Location is too long").optional(),
  summary: z.string().trim().max(1000, "Summary is too long").optional(),
  highlights: z.array(z.string().trim()).optional(),
  projectIds: z.array(z.string()).optional(),
  roleIds: z.array(z.string()).optional(),
  skillIds: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

function revalidateEventRoutes() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/events");
  revalidatePath("/admin/dashboard/achievements");
  revalidatePath("/admin/dashboard/achievements/awards");
  revalidatePath("/");
  revalidatePath("/cv");
}

// ─── Relationship Validation Helpers ─────────────────────────────────────────

async function validateIds(
  rawIds: string[],
  model: typeof ProjectModel | typeof RoleModel | typeof SkillModel,
  modelName: string
): Promise<{ validIds: mongoose.Types.ObjectId[]; error?: string }> {
  if (!rawIds || rawIds.length === 0) {
    return { validIds: [] };
  }

  const cleanIds = Array.from(new Set(rawIds.filter((id) => id && id.trim())));
  for (const id of cleanIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { validIds: [], error: `Invalid ${modelName} ID syntax: "${id}"` };
    }
  }

  const objectIds = cleanIds.map((id) => new mongoose.Types.ObjectId(id));
  const count = await (model as unknown as mongoose.Model<mongoose.Document>).countDocuments({ _id: { $in: objectIds } });
  if (count !== objectIds.length) {
    return { validIds: [], error: `One or more requested ${modelName} IDs do not exist in the database.` };
  }

  return { validIds: objectIds };
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Creates a new canonical Event document.
 */
export async function createEvent(input: CreateEventInput): Promise<ActionResult<PlainEvent>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = createEventSchema.parse(input);

    const startNorm = parseAndNormalizeCmsDate(parsed.startDateRaw, parsed.startDatePrecision);
    if (!startNorm.date || !startNorm.precision) {
      return { success: false, error: "Valid start date and start date precision are required." };
    }

    const endNorm = parseAndNormalizeCmsDate(parsed.endDateRaw, parsed.endDatePrecision);

    if (startNorm.date && endNorm.date && !validateDateRange(startNorm.date, endNorm.date)) {
      return { success: false, error: "End date must be greater than or equal to start date." };
    }

    const [projectCheck, roleCheck, skillCheck] = await Promise.all([
      validateIds(parsed.projectIds, ProjectModel, "Project"),
      validateIds(parsed.roleIds, RoleModel, "Role"),
      validateIds(parsed.skillIds, SkillModel, "Skill"),
    ]);

    if (projectCheck.error) return { success: false, error: projectCheck.error };
    if (roleCheck.error) return { success: false, error: roleCheck.error };
    if (skillCheck.error) return { success: false, error: skillCheck.error };

    const cleanHighlights = parsed.highlights.map((h) => h.trim()).filter((h) => h.length > 0);

    const created = await EventModel.create({
      title: parsed.title,
      eventType: parsed.eventType,
      organizer: parsed.organizer || undefined,
      startDate: startNorm.date,
      startDatePrecision: startNorm.precision,
      endDate: endNorm.date || undefined,
      endDatePrecision: endNorm.precision || undefined,
      location: parsed.location || undefined,
      summary: parsed.summary || undefined,
      highlights: cleanHighlights,
      projectIds: projectCheck.validIds,
      roleIds: roleCheck.validIds,
      skillIds: skillCheck.validIds,
      featured: parsed.featured,
      displayOrder: parsed.displayOrder,
      publicationStatus: parsed.publicationStatus,
    });

    revalidateEventRoutes();

    const { events } = await getCanonicalEvents();
    const plainEvent = events.find((e) => e._id === String(created._id));

    return { success: true, data: plainEvent };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to create Event.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing canonical Event document with narrow $set / $unset operations.
 */
export async function updateEvent(input: UpdateEventInput): Promise<ActionResult<PlainEvent>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = updateEventSchema.parse(input);

    const existing = await EventModel.findById(parsed.id);
    if (!existing) {
      return { success: false, error: "Event record not found." };
    }

    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, unknown> = {};

    if (parsed.title !== undefined) setFields.title = parsed.title;
    if (parsed.eventType !== undefined) setFields.eventType = parsed.eventType;
    if (parsed.featured !== undefined) setFields.featured = parsed.featured;
    if (parsed.displayOrder !== undefined) setFields.displayOrder = parsed.displayOrder;
    if (parsed.publicationStatus !== undefined) setFields.publicationStatus = parsed.publicationStatus;

    if (parsed.organizer === "") unsetFields.organizer = 1;
    else if (parsed.organizer !== undefined) setFields.organizer = parsed.organizer;

    if (parsed.location === "") unsetFields.location = 1;
    else if (parsed.location !== undefined) setFields.location = parsed.location;

    if (parsed.summary === "") unsetFields.summary = 1;
    else if (parsed.summary !== undefined) setFields.summary = parsed.summary;

    if (parsed.highlights !== undefined) {
      setFields.highlights = parsed.highlights.map((h) => h.trim()).filter((h) => h.length > 0);
    }

    // Relationship arrays
    if (parsed.projectIds !== undefined) {
      const check = await validateIds(parsed.projectIds, ProjectModel, "Project");
      if (check.error) return { success: false, error: check.error };
      setFields.projectIds = check.validIds;
    }

    if (parsed.roleIds !== undefined) {
      const check = await validateIds(parsed.roleIds, RoleModel, "Role");
      if (check.error) return { success: false, error: check.error };
      setFields.roleIds = check.validIds;
    }

    if (parsed.skillIds !== undefined) {
      const check = await validateIds(parsed.skillIds, SkillModel, "Skill");
      if (check.error) return { success: false, error: check.error };
      setFields.skillIds = check.validIds;
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

    // Candidate future merged state validation
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

    if (!candidateStart || !candidateStartPrec) {
      return { success: false, error: "Event start date and start date precision cannot be cleared." };
    }

    if (Boolean(candidateEnd) !== Boolean(candidateEndPrec)) {
      return { success: false, error: "End date and end date precision must both be present or both be cleared." };
    }

    if (candidateStart && candidateEnd && !validateDateRange(candidateStart, candidateEnd)) {
      return { success: false, error: "End date must be greater than or equal to start date." };
    }

    const updateQuery: Record<string, unknown> = {};
    if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;
    if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

    if (Object.keys(updateQuery).length === 0) {
      const { events } = await getCanonicalEvents();
      return { success: true, data: events.find((e) => e._id === parsed.id) };
    }

    const updated = await EventModel.findByIdAndUpdate(parsed.id, updateQuery, {
      new: true,
      runValidators: true,
    }).lean<IEvent>();

    if (!updated) {
      return { success: false, error: "Event not found after update attempt." };
    }

    revalidateEventRoutes();

    const { events } = await getCanonicalEvents();
    const plainEvent = events.find((e) => e._id === parsed.id);

    return { success: true, data: plainEvent };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to update Event.";
    return { success: false, error: message };
  }
}

/**
 * Sets an Event's publicationStatus to "archived". Retains document and relationships.
 */
export async function archiveEvent(id: string): Promise<ActionResult<PlainEvent>> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string") {
      return { success: false, error: "Event ID is required." };
    }

    const existing = await EventModel.findById(id);
    if (!existing) {
      return { success: false, error: "Event record not found." };
    }

    const updated = await EventModel.findByIdAndUpdate(
      id,
      { $set: { publicationStatus: "archived" } },
      { new: true, runValidators: true }
    ).lean<IEvent>();

    if (!updated) {
      return { success: false, error: "Failed to archive Event." };
    }

    revalidateEventRoutes();

    const { events } = await getCanonicalEvents();
    const plainEvent = events.find((e) => e._id === id);

    return { success: true, data: plainEvent };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to archive Event.";
    return { success: false, error: message };
  }
}

/**
 * Hard deletes an Event document ONLY if zero incoming references exist.
 * Uses a Mongoose transaction to ensure session-scoped dependency authorization.
 */
export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Valid Event ID is required." };
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const eventObjectId = new mongoose.Types.ObjectId(id);

      const event = await EventModel.findById(id).session(session).lean<IEvent>();
      if (!event) {
        await session.abortTransaction();
        return { success: false, error: "Event record not found." };
      }

      // Check incoming Award references
      const awards = await AwardModel.find({ relatedEventId: eventObjectId })
        .select("title")
        .session(session)
        .lean();

      if (awards.length > 0) {
        await session.abortTransaction();
        return {
          success: false,
          error: `Cannot delete Event "${event.title}". It is referenced by ${awards.length} Award(s) (${awards.map((a) => a.title).join(", ")}). Please use Archive instead.`,
          dependencies: {
            awards: awards.map((a) => ({ id: String(a._id), title: a.title })),
          },
        };
      }

      const deleteRes = await EventModel.deleteOne({ _id: id }).session(session);

      if (deleteRes.deletedCount !== 1) {
        await session.abortTransaction();
        return { success: false, error: "Failed to verify Event deletion count." };
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

    revalidateEventRoutes();

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete Event.";
    return { success: false, error: message };
  }
}
