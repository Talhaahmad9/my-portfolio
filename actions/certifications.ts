"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongo";
import { requireAdmin } from "@/lib/admin/require-admin";
import { CertificationModel, ICertificationEntity } from "@/lib/db/models/Certification";
import { SkillModel } from "@/lib/db/models/Skill";
import { validateDateRange } from "@/lib/admin/cms-date-input";
import { getCanonicalCertifications, PlainCertification } from "@/lib/admin/queries/achievements";

import { uploadToR2, cleanupObsoleteR2Objects, rollbackR2Uploads } from "@/lib/r2";
import { randomUUID } from "crypto";

// ─── Interfaces & Schemas ────────────────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export const createCertificationSchema = z.object({
  name: z.string().trim().min(1, "Certification name is required").max(150, "Name is too long"),
  issuer: z.string().trim().min(1, "Issuer is required").max(150, "Issuer is too long"),
  issueDateRaw: z.string().optional(),
  expiryDateRaw: z.string().optional(),
  credentialId: z.string().trim().max(150, "Credential ID is too long").optional(),
  credentialUrl: z.string().trim().url("Credential URL must be a valid URL").optional().or(z.literal("")),
  description: z.string().trim().max(3000, "Description is too long").optional(),
  skillIds: z.array(z.string()).default([]),
  displayOrder: z.number().int().default(0),
  publicationStatus: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updateCertificationSchema = z.object({
  id: z.string().min(1, "Certification ID is required"),
  name: z.string().trim().min(1, "Certification name cannot be empty").max(150, "Name is too long").optional(),
  issuer: z.string().trim().min(1, "Issuer cannot be empty").max(150, "Issuer is too long").optional(),
  issueDateRaw: z.string().optional(),
  expiryDateRaw: z.string().optional(),
  credentialId: z.string().trim().max(150, "Credential ID is too long").optional(),
  credentialUrl: z.string().trim().url("Credential URL must be a valid URL").optional().or(z.literal("")),
  description: z.string().trim().max(3000, "Description is too long").optional(),
  skillIds: z.array(z.string()).optional(),
  displayOrder: z.number().int().optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
});

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;

function revalidateCertRoutes(publicId?: string | null) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/achievements");
  revalidatePath("/admin/dashboard/achievements/certifications");
  revalidatePath("/");
  revalidatePath("/cv");
  if (publicId && publicId.trim()) {
    revalidatePath(`/certificates/${publicId.trim()}`);
  }
}

// ─── Exact Day Date Helper ────────────────────────────────────────────────────

function parseExactDayDate(dateRaw?: string | null): { date?: Date; clear: boolean; error?: string } {
  if (dateRaw === undefined) {
    return { clear: false };
  }

  if (dateRaw === null || dateRaw.trim() === "") {
    return { clear: true };
  }

  const trimmed = dateRaw.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return {
      clear: false,
      error: "Exact date (YYYY-MM-DD) is required. Partial dates (e.g. month-only or year-only) are not supported.",
    };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(date.getTime())) {
    return { clear: false, error: "Invalid date value." };
  }

  return { date, clear: false };
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Creates a new canonical Certification document.
 */
export async function createCertification(input: CreateCertificationInput): Promise<ActionResult<PlainCertification>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = createCertificationSchema.parse(input);

    // Publication eligibility invariant check for new records
    if (parsed.publicationStatus === "published") {
      return {
        success: false,
        error: "Cannot publish a certification without a valid publicId and mediaUrl.",
      };
    }

    const issueRes = parseExactDayDate(parsed.issueDateRaw);
    if (issueRes.error) return { success: false, error: issueRes.error };

    const expiryRes = parseExactDayDate(parsed.expiryDateRaw);
    if (expiryRes.error) return { success: false, error: expiryRes.error };

    if (issueRes.date && expiryRes.date && !validateDateRange(issueRes.date, expiryRes.date)) {
      return { success: false, error: "Expiry date must be greater than or equal to issue date." };
    }

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

    const created = await CertificationModel.create({
      name: parsed.name,
      issuer: parsed.issuer,
      issueDate: issueRes.date || undefined,
      expiryDate: expiryRes.date || undefined,
      credentialId: parsed.credentialId || undefined,
      credentialUrl: parsed.credentialUrl || undefined,
      description: parsed.description || undefined,
      skillIds: validSkillIds,
      displayOrder: parsed.displayOrder,
      publicationStatus: parsed.publicationStatus,
    });

    revalidateCertRoutes(created.publicId);

    const { certifications } = await getCanonicalCertifications();
    const plainCert = certifications.find((c) => c._id === String(created._id));

    return { success: true, data: plainCert };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to create Certification.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing canonical Certification document with narrow $set / $unset operations.
 * Preserves existing publicId and mediaUrl intact.
 */
export async function updateCertification(input: UpdateCertificationInput): Promise<ActionResult<PlainCertification>> {
  try {
    await requireAdmin();
    await connectDB();

    const parsed = updateCertificationSchema.parse(input);

    const existing = await CertificationModel.findById(parsed.id);
    if (!existing) {
      return { success: false, error: "Certification record not found." };
    }

    // Publication eligibility invariant check for updates
    const candidateStatus = parsed.publicationStatus ?? existing.publicationStatus;
    const candidatePublicId = existing.publicId?.trim();
    const candidateMediaUrl = existing.mediaUrl?.trim();

    if (candidateStatus === "published" && (!candidatePublicId || !candidateMediaUrl)) {
      return {
        success: false,
        error: "Cannot publish a certification without a valid publicId and mediaUrl.",
      };
    }

    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, unknown> = {};

    if (parsed.name !== undefined) setFields.name = parsed.name;
    if (parsed.issuer !== undefined) setFields.issuer = parsed.issuer;
    if (parsed.displayOrder !== undefined) setFields.displayOrder = parsed.displayOrder;
    if (parsed.publicationStatus !== undefined) setFields.publicationStatus = parsed.publicationStatus;

    if (parsed.credentialId === "") unsetFields.credentialId = 1;
    else if (parsed.credentialId !== undefined) setFields.credentialId = parsed.credentialId;

    if (parsed.credentialUrl === "") unsetFields.credentialUrl = 1;
    else if (parsed.credentialUrl !== undefined) setFields.credentialUrl = parsed.credentialUrl;

    if (parsed.description === "") unsetFields.description = 1;
    else if (parsed.description !== undefined) setFields.description = parsed.description;

    // Date updates & clear handling
    const issueRes = parseExactDayDate(parsed.issueDateRaw);
    if (issueRes.error) return { success: false, error: issueRes.error };
    if (issueRes.clear) unsetFields.issueDate = 1;
    else if (issueRes.date) setFields.issueDate = issueRes.date;

    const expiryRes = parseExactDayDate(parsed.expiryDateRaw);
    if (expiryRes.error) return { success: false, error: expiryRes.error };
    if (expiryRes.clear) unsetFields.expiryDate = 1;
    else if (expiryRes.date) setFields.expiryDate = expiryRes.date;

    // Candidate future state for range validation
    const candidateIssue: Date | undefined = unsetFields.issueDate
      ? undefined
      : setFields.issueDate !== undefined
      ? (setFields.issueDate as Date)
      : existing.issueDate;

    const candidateExpiry: Date | undefined = unsetFields.expiryDate
      ? undefined
      : setFields.expiryDate !== undefined
      ? (setFields.expiryDate as Date)
      : existing.expiryDate;

    if (candidateIssue && candidateExpiry && !validateDateRange(candidateIssue, candidateExpiry)) {
      return { success: false, error: "Expiry date must be greater than or equal to issue date." };
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
      const { certifications } = await getCanonicalCertifications();
      return { success: true, data: certifications.find((c) => c._id === parsed.id) };
    }

    const updated = await CertificationModel.findByIdAndUpdate(parsed.id, updateQuery, {
      new: true,
      runValidators: true,
    }).lean<ICertificationEntity>();

    if (!updated) {
      return { success: false, error: "Certification not found after update attempt." };
    }

    revalidateCertRoutes(existing.publicId);

    const { certifications } = await getCanonicalCertifications();
    const plainCert = certifications.find((c) => c._id === parsed.id);

    return { success: true, data: plainCert };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    const message = err instanceof Error ? err.message : "Failed to update Certification.";
    return { success: false, error: message };
  }
}

/**
 * Sets a Certification's publicationStatus to "archived". Retains document and relationships.
 */
export async function archiveCertification(id: string): Promise<ActionResult<PlainCertification>> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string") {
      return { success: false, error: "Certification ID is required." };
    }

    const existing = await CertificationModel.findById(id);
    if (!existing) {
      return { success: false, error: "Certification record not found." };
    }

    const updated = await CertificationModel.findByIdAndUpdate(
      id,
      { $set: { publicationStatus: "archived" } },
      { new: true, runValidators: true }
    ).lean<ICertificationEntity>();

    if (!updated) {
      return { success: false, error: "Failed to archive Certification." };
    }

    revalidateCertRoutes(existing.publicId);

    const { certifications } = await getCanonicalCertifications();
    const plainCert = certifications.find((c) => c._id === id);

    return { success: true, data: plainCert };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to archive Certification.";
    return { success: false, error: message };
  }
}

/**
 * Hard deletes a Certification document inside a session transaction.
 * HARD DELETE IS BLOCKED if mediaUrl is present on the document!
 */
export async function deleteCertification(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Valid Certification ID is required." };
    }

    const session = await mongoose.startSession();
    let certPublicId: string | undefined = undefined;
    try {
      session.startTransaction();

      const cert = await CertificationModel.findById(id).session(session).lean<ICertificationEntity>();
      if (!cert) {
        await session.abortTransaction();
        return { success: false, error: "Certification record not found." };
      }

      certPublicId = cert.publicId;

      // Hard Delete Media Guard Rule
      if (cert.mediaUrl && cert.mediaUrl.trim() !== "") {
        await session.abortTransaction();
        return {
          success: false,
          error: `Hard deletion is blocked because certificate media is attached ("${cert.name}"). Please archive this certification instead.`,
        };
      }

      const deleteRes = await CertificationModel.deleteOne({ _id: id }).session(session);

      if (deleteRes.deletedCount !== 1) {
        await session.abortTransaction();
        return { success: false, error: "Failed to verify Certification deletion count." };
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

    revalidateCertRoutes(certPublicId);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete Certification.";
    return { success: false, error: message };
  }
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadCertificationMedia(id: string, formData: FormData): Promise<ActionResult<PlainCertification>> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Valid Certification ID is required." };
    }

    const existing = await CertificationModel.findById(id);
    if (!existing) {
      return { success: false, error: "Certification record not found." };
    }

    const file = formData.get("media") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "No media file provided." };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Only JPG, PNG, WebP, and PDF files are allowed." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = sanitizeFilename(file.name || "media");
    const key = `certificates/${Date.now()}-${randomUUID()}-${safeName}`;

    let uploadedUrl = "";
    try {
      const res = await uploadToR2(buffer, key, file.type);
      uploadedUrl = res.url;
    } catch {
      return { success: false, error: "Failed to upload media to R2." };
    }

    const oldMediaUrl = existing.mediaUrl;
    const publicId = existing.publicId || randomUUID();

    const updated = await CertificationModel.findByIdAndUpdate(
      id,
      { $set: { mediaUrl: uploadedUrl, publicId } },
      { new: true, runValidators: true }
    ).lean<ICertificationEntity>();

    if (!updated) {
      await rollbackR2Uploads([key]);
      return { success: false, error: "Failed to update Certification with media URL." };
    }

    if (oldMediaUrl) {
      await cleanupObsoleteR2Objects([oldMediaUrl]);
    }

    revalidateCertRoutes(publicId);

    const { certifications } = await getCanonicalCertifications();
    const plainCert = certifications.find((c) => c._id === id);

    return { success: true, data: plainCert };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload certification media.";
    return { success: false, error: message };
  }
}

export async function removeCertificationMedia(id: string): Promise<ActionResult<PlainCertification>> {
  try {
    await requireAdmin();
    await connectDB();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Valid Certification ID is required." };
    }

    const existing = await CertificationModel.findById(id);
    if (!existing) {
      return { success: false, error: "Certification record not found." };
    }

    const oldMediaUrl = existing.mediaUrl;
    if (!oldMediaUrl) {
      return { success: false, error: "No media attached to this certification." };
    }

    if (existing.publicationStatus === "published") {
      return { success: false, error: "Cannot remove media from a published certification. Archive or unpublish it first." };
    }

    const updated = await CertificationModel.findByIdAndUpdate(
      id,
      { $unset: { mediaUrl: 1, publicId: 1 } },
      { new: true, runValidators: true }
    ).lean<ICertificationEntity>();

    if (!updated) {
      return { success: false, error: "Failed to detach media from Certification." };
    }

    await cleanupObsoleteR2Objects([oldMediaUrl]);

    revalidateCertRoutes(existing.publicId);

    const { certifications } = await getCanonicalCertifications();
    const plainCert = certifications.find((c) => c._id === id);

    return { success: true, data: plainCert };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove certification media.";
    return { success: false, error: message };
  }
}
