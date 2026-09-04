"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongo";
import { requireAdmin } from "@/lib/admin/require-admin";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { RoleModel } from "@/lib/db/models/Role";
import { ProjectModel } from "@/lib/db/models/Project";
import { EventModel } from "@/lib/db/models/Event";
import { AwardModel } from "@/lib/db/models/Award";
import { CertificationModel } from "@/lib/db/models/Certification";
import { PlainSkill } from "@/lib/admin/queries/skills";

// ─── Interfaces & Validation Schemas ─────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
  dependencies?: {
    roles?: Array<{ id: string; title: string }>;
    projects?: Array<{ id: string; title: string }>;
    events?: Array<{ id: string; title: string }>;
    awards?: Array<{ id: string; title: string }>;
    certifications?: Array<{ id: string; title: string }>;
  };
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createSkillSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .trim()
    .lowercase()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(SLUG_REGEX, "Slug must contain only lowercase letters, numbers, and hyphens (e.g. nextjs, framer-motion)"),
  category: z.string().trim().min(1, "Category is required").max(100, "Category is too long"),
  summary: z.string().trim().max(500, "Summary is too long").optional(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  publicationStatus: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updateSkillSchema = z.object({
  id: z.string().min(1, "Skill ID is required"),
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name is too long").optional(),
  slug: z
    .string()
    .trim()
    .lowercase()
    .min(1, "Slug cannot be empty")
    .max(100, "Slug is too long")
    .regex(SLUG_REGEX, "Slug must contain only lowercase letters, numbers, and hyphens (e.g. nextjs, framer-motion)")
    .optional(),
  category: z.string().trim().min(1, "Category cannot be empty").max(100, "Category is too long").optional(),
  summary: z.string().trim().max(500, "Summary is too long").optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;

function toPlainSkill(doc: ISkill): PlainSkill {
  return {
    _id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    summary: doc.summary,
    featured: doc.featured ?? false,
    displayOrder: doc.displayOrder ?? 0,
    publicationStatus: doc.publicationStatus,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
  };
}

function revalidateSkillRoutes() {
  revalidatePath("/");
  revalidatePath("/cv");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/skills");
  revalidatePath("/admin/dashboard/experience/roles");
  revalidatePath("/admin/dashboard/events");
  revalidatePath("/admin/dashboard/achievements/awards");
  revalidatePath("/admin/dashboard/achievements/certifications");
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Creates a new canonical Skill document.
 */
export async function createSkill(input: CreateSkillInput): Promise<ActionResult<PlainSkill>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = createSkillSchema.parse(input);

    const slugExists = await SkillModel.exists({ slug: parsed.slug });
    if (slugExists) {
      return {
        success: false,
        error: `A Skill with slug "${parsed.slug}" already exists. Please choose a unique slug.`,
      };
    }

    const created = await SkillModel.create({
      name: parsed.name,
      slug: parsed.slug,
      category: parsed.category,
      summary: parsed.summary || undefined,
      featured: parsed.featured,
      displayOrder: parsed.displayOrder,
      publicationStatus: parsed.publicationStatus,
    });

    revalidateSkillRoutes();

    return {
      success: true,
      data: toPlainSkill(created),
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to create Skill.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing canonical Skill document with partial update semantics.
 */
export async function updateSkill(input: UpdateSkillInput): Promise<ActionResult<PlainSkill>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = updateSkillSchema.parse(input);

    const existing = await SkillModel.findById(parsed.id);
    if (!existing) {
      return { success: false, error: "Skill not found." };
    }

    if (parsed.slug && parsed.slug !== existing.slug) {
      const slugCollision = await SkillModel.exists({
        slug: parsed.slug,
        _id: { $ne: parsed.id },
      });
      if (slugCollision) {
        return {
          success: false,
          error: `A Skill with slug "${parsed.slug}" already exists. Please choose a unique slug.`,
        };
      }
    }

    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, unknown> = {};

    if (parsed.name !== undefined) setFields.name = parsed.name;
    if (parsed.slug !== undefined) setFields.slug = parsed.slug;
    if (parsed.category !== undefined) setFields.category = parsed.category;
    if (parsed.featured !== undefined) setFields.featured = parsed.featured;
    if (parsed.displayOrder !== undefined) setFields.displayOrder = parsed.displayOrder;
    if (parsed.publicationStatus !== undefined) setFields.publicationStatus = parsed.publicationStatus;

    if (parsed.summary === "") {
      unsetFields.summary = 1;
    } else if (parsed.summary !== undefined) {
      setFields.summary = parsed.summary;
    }

    const updateQuery: Record<string, unknown> = {};
    if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;
    if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

    if (Object.keys(updateQuery).length === 0) {
      return { success: true, data: toPlainSkill(existing) };
    }

    const updated = await SkillModel.findByIdAndUpdate(parsed.id, updateQuery, {
      new: true,
      runValidators: true,
    }).lean<ISkill>();

    if (!updated) {
      return { success: false, error: "Skill not found after update attempt." };
    }

    revalidateSkillRoutes();

    return {
      success: true,
      data: toPlainSkill(updated),
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to update Skill.";
    return { success: false, error: message };
  }
}

/**
 * Sets a Skill's publicationStatus to "archived".
 * Retains document and existing graph relationships.
 */
export async function archiveSkill(id: string): Promise<ActionResult<PlainSkill>> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string") {
      return { success: false, error: "Skill ID is required." };
    }

    const existing = await SkillModel.findById(id);
    if (!existing) {
      return { success: false, error: "Skill not found." };
    }

    const updated = await SkillModel.findByIdAndUpdate(
      id,
      { $set: { publicationStatus: "archived" } },
      { new: true, runValidators: true }
    ).lean<ISkill>();

    if (!updated) {
      return { success: false, error: "Failed to archive Skill." };
    }

    revalidateSkillRoutes();

    return {
      success: true,
      data: toPlainSkill(updated),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to archive Skill.";
    return { success: false, error: message };
  }
}

/**
 * Hard deletes a Skill document ONLY if zero incoming references exist.
 * Uses a Mongoose transaction to ensure atomicity, executing all dependency reads
 * within the session before granting deletion authorization.
 */
export async function deleteSkill(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Valid Skill ID is required." };
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const skillObjectId = new mongoose.Types.ObjectId(id);

      // 1. Read target Skill WITH session
      const skill = await SkillModel.findById(id).session(session).lean<ISkill>();
      if (!skill) {
        await session.abortTransaction();
        return { success: false, error: "Skill not found." };
      }

      // 2. Inspect incoming references across all domain models WITH SAME session
      const [roles, projects, events, awards, certs] = await Promise.all([
        RoleModel.find({ skillIds: skillObjectId })
          .select("roleTitle organization")
          .session(session)
          .lean(),
        ProjectModel.find({
          $or: [
            { skillIds: skillObjectId },
            { "architecture.components.skillIds": skillObjectId },
          ],
        })
          .select("title")
          .session(session)
          .lean(),
        EventModel.find({ skillIds: skillObjectId })
          .select("title")
          .session(session)
          .lean(),
        AwardModel.find({ skillIds: skillObjectId })
          .select("title")
          .session(session)
          .lean(),
        CertificationModel.find({ skillIds: skillObjectId })
          .select("name")
          .session(session)
          .lean(),
      ]);

      const hasReferences =
        roles.length > 0 || projects.length > 0 || events.length > 0 || awards.length > 0 || certs.length > 0;

      if (hasReferences) {
        await session.abortTransaction();

        const depSummaryParts: string[] = [];
        if (projects.length > 0) {
          depSummaryParts.push(
            `${projects.length} Project(s) (${projects.map((p) => p.title).join(", ")})`
          );
        }
        if (events.length > 0) {
          depSummaryParts.push(
            `${events.length} Event(s) (${events.map((e) => e.title).join(", ")})`
          );
        }
        if (roles.length > 0) {
          depSummaryParts.push(
            `${roles.length} Role(s) (${roles.map((r) => `${r.roleTitle} @ ${r.organization}`).join(", ")})`
          );
        }
        if (awards.length > 0) {
          depSummaryParts.push(
            `${awards.length} Award(s) (${awards.map((a) => a.title).join(", ")})`
          );
        }
        if (certs.length > 0) {
          depSummaryParts.push(
            `${certs.length} Certification(s) (${certs.map((c) => c.name).join(", ")})`
          );
        }

        return {
          success: false,
          error: `Cannot delete Skill "${skill.name}". It is referenced by: ${depSummaryParts.join("; ")}. Please use Archive instead to preserve database integrity.`,
          dependencies: {
            roles: roles.map((r) => ({ id: String(r._id), title: `${r.roleTitle} @ ${r.organization}` })),
            projects: projects.map((p) => ({ id: String(p._id), title: p.title })),
            events: events.map((e) => ({ id: String(e._id), title: e.title })),
            awards: awards.map((a) => ({ id: String(a._id), title: a.title })),
            certifications: certs.map((c) => ({ id: String(c._id), title: c.name })),
          },
        };
      }

      // 3. Delete Skill WITH SAME session
      const deleteRes = await SkillModel.deleteOne({ _id: id }).session(session);

      if (deleteRes.deletedCount !== 1) {
        await session.abortTransaction();
        return { success: false, error: "Failed to verify Skill deletion count." };
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

    revalidateSkillRoutes();

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete Skill.";
    return { success: false, error: message };
  }
}
