"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { IProject, ProjectModel, ITechnicalDecision, ITechnicalChallenge, IMetric, ISEOOverride } from "@/lib/db/models/Project";
import { EventModel } from "@/lib/db/models/Event";
import { AwardModel } from "@/lib/db/models/Award";
import { SkillModel } from "@/lib/db/models/Skill";
import { RoleModel } from "@/lib/db/models/Role";
import { connectDB } from "@/lib/db/mongo";
import { PublicationStatus } from "@/lib/cms/types";
import { normalizeProjectBadgeLabel } from "@/lib/project-badges";
import { projectSchema } from "@/lib/validate";
import { decodeLegacyEscapedContent, sanitizeObject } from "@/lib/sanitize";
import {
  cleanupObsoleteR2Objects,
  rollbackR2Uploads,
  uploadToR2,
} from "@/lib/r2";
import { auth } from "@/lib/auth";

export interface ActionResult<T> {
  success: boolean;
  error?: string;
  data?: T;
  dependencies?: {
    events?: Array<{ id: string; title: string }>;
    awards?: Array<{ id: string; title: string }>;
  };
}

const ALLOWED_PROJECT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

const ALLOWED_PROJECT_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "svg",
]);

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toPlainProject<T>(project: T): T {
  return decodeLegacyEscapedContent(JSON.parse(JSON.stringify(project)) as T);
}

function parseStringArray(json: string | null): string[] {
  if (!json) {
    return [];
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  } catch {
    return [];
  }
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "on";
}

function parseNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop();
  return ext ? ext.toLowerCase() : "";
}

function validateProjectImageFile(file: File): void {
  const extension = getFileExtension(file.name);
  const hasAllowedType = ALLOWED_PROJECT_IMAGE_TYPES.has(file.type);
  const hasAllowedExtension = ALLOWED_PROJECT_IMAGE_EXTENSIONS.has(extension);

  if (!hasAllowedType && !hasAllowedExtension) {
    throw new Error("Only JPG, PNG, WebP, AVIF, GIF, and SVG files are allowed");
  }
}

interface UploadedImagesResult {
  keys: string[];
  urls: string[];
}

async function uploadImages(files: File[]): Promise<UploadedImagesResult> {
  if (files.length === 0) {
    return { keys: [], urls: [] };
  }

  const keys: string[] = [];
  const urls: string[] = [];

  for (const file of files) {
    try {
      validateProjectImageFile(file);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = sanitizeFilename(file.name || "image");
      const key = `projects/${Date.now()}-${randomUUID()}-${safeName}`;

      const res = await uploadToR2(buffer, key, file.type || "application/octet-stream");
      keys.push(res.key);
      urls.push(res.url);
    } catch (error) {
      if (keys.length > 0) {
        await rollbackR2Uploads(keys);
      }
      throw error;
    }
  }

  return { keys, urls };
}

function getImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function validateSlugFormat(slug: string): Promise<string | null> {
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed) {
    return "Slug is required for canonical Projects.";
  }
  if (!SLUG_REGEX.test(trimmed)) {
    return `Malformed slug "${slug}". Slugs must be lowercase, alphanumeric, and hyphen-separated (e.g. "staydue", "multi-agent-simulation-engine").`;
  }
  return null;
}

export async function validateSkillIds(
  skillIds: string[] | undefined
): Promise<{ objectIds?: mongoose.Types.ObjectId[]; error?: string }> {
  if (skillIds === undefined) return {};
  const clean = Array.from(new Set(skillIds.filter((s) => typeof s === "string" && s.trim())));
  if (clean.length === 0) return { objectIds: [] };

  for (const id of clean) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { error: `Invalid Skill ID syntax: "${id}"` };
    }
  }

  const objectIds = clean.map((id) => new mongoose.Types.ObjectId(id));
  const count = await SkillModel.countDocuments({ _id: { $in: objectIds } });
  if (count !== objectIds.length) {
    return { error: "One or more requested Skill IDs do not exist in the database." };
  }

  return { objectIds };
}

export async function validateRoleIds(
  roleIds: string[] | undefined
): Promise<{ objectIds?: mongoose.Types.ObjectId[]; error?: string }> {
  if (roleIds === undefined) return {};
  const clean = Array.from(new Set(roleIds.filter((r) => typeof r === "string" && r.trim())));
  if (clean.length === 0) return { objectIds: [] };

  for (const id of clean) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { error: `Invalid Role ID syntax: "${id}"` };
    }
  }

  const objectIds = clean.map((id) => new mongoose.Types.ObjectId(id));
  const count = await RoleModel.countDocuments({ _id: { $in: objectIds } });
  if (count !== objectIds.length) {
    return { error: "One or more requested Role IDs do not exist in the database." };
  }

  return { objectIds };
}

function parseJsonField<T>(jsonStr: string | null): T | undefined {
  if (!jsonStr) return undefined;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return undefined;
  }
}

export async function getProjects(): Promise<IProject[]> {
  await connectDB();
  const projects = await ProjectModel.find({}).sort({ order: 1 }).lean();
  return toPlainProject(projects);
}

export async function createProject(formData: FormData): Promise<ActionResult<IProject>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  await connectDB();

  let uploadedKeys: string[] = [];
  try {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      return { success: false, error: "Title is required." };
    }

    const rawSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
    const slugErr = await validateSlugFormat(rawSlug);
    if (slugErr) {
      return { success: false, error: slugErr };
    }

    // Slug collision check
    const slugExists = await ProjectModel.exists({ slug: rawSlug });
    if (slugExists) {
      return { success: false, error: `Slug "${rawSlug}" already exists. Slugs must be unique.` };
    }

    // Parse relationship ObjectIds
    const rawSkillIds = parseStringArray(formData.get("skillIds")?.toString() ?? null);
    const skillRes = await validateSkillIds(formData.has("skillIds") ? rawSkillIds : undefined);
    if (skillRes.error) {
      return { success: false, error: skillRes.error };
    }

    const rawRoleIds = parseStringArray(formData.get("roleIds")?.toString() ?? null);
    const roleRes = await validateRoleIds(formData.has("roleIds") ? rawRoleIds : undefined);
    if (roleRes.error) {
      return { success: false, error: roleRes.error };
    }

    const imageFiles = getImageFiles(formData);
    const uploadedImages = await uploadImages(imageFiles);
    uploadedKeys = uploadedImages.keys;

    const legacyRaw = {
      title,
      images: uploadedImages.urls,
      imageFit: String(formData.get("imageFit") ?? "cover"),
      githubUrl: String(formData.get("githubUrl") ?? ""),
      badge: String(formData.get("badge") ?? ""),
    };

    const parsedLegacy = projectSchema.safeParse(legacyRaw);
    if (!parsedLegacy.success) {
      if (uploadedKeys.length > 0) await rollbackR2Uploads(uploadedKeys);
      return { success: false, error: parsedLegacy.error.issues[0]?.message ?? "Invalid project data" };
    }

    const sanitizedLegacy = sanitizeObject(parsedLegacy.data);

    // Canonical fields
    const tagline = normalizeOptionalString(formData.get("tagline")?.toString());
    const shortDescription = normalizeOptionalString(formData.get("shortDescription")?.toString());
    const longDescription = normalizeOptionalString(formData.get("longDescription")?.toString());
    const publicationStatus = (formData.get("publicationStatus")?.toString() as PublicationStatus) || "draft";
    const projectType = normalizeOptionalString(formData.get("projectType")?.toString()) as IProject["projectType"];
    const category = normalizeOptionalString(formData.get("category")?.toString()) as IProject["category"];
    const documentationUrl = normalizeOptionalString(formData.get("documentationUrl")?.toString());
    const demoUrl = normalizeOptionalString(formData.get("demoUrl")?.toString());
    const architectureOverview = normalizeOptionalString(formData.get("architectureOverview")?.toString());
    const architectureDiagramUrl = normalizeOptionalString(formData.get("architectureDiagramUrl")?.toString());

    // JSON Subdocuments
    const technicalDecisions = parseJsonField<ITechnicalDecision[]>(formData.get("technicalDecisions")?.toString() ?? null);
    const challenges = parseJsonField<ITechnicalChallenge[]>(formData.get("challenges")?.toString() ?? null);
    const outcomes = parseJsonField<string[]>(formData.get("outcomes")?.toString() ?? null);
    const metrics = parseJsonField<IMetric[]>(formData.get("metrics")?.toString() ?? null);
    const seo = parseJsonField<ISEOOverride>(formData.get("seo")?.toString() ?? null);

    const newProjectDoc: Partial<IProject> = {
      ...sanitizedLegacy,
      githubUrl: normalizeOptionalString(sanitizedLegacy.githubUrl),
      badge: normalizeProjectBadgeLabel(sanitizedLegacy.badge),

      // Sync featured with isFeatured (fallback to false if missing)
      isFeatured: formData.has("isFeatured") ? parseBoolean(formData.get("isFeatured")) : false,
      displayOrder: formData.has("displayOrder") ? parseNumber(formData.get("displayOrder")) : 0,

      // Canonical fields
      slug: rawSlug,
      tagline,
      shortDescription,
      longDescription,
      publicationStatus,
      projectType,
      category,
      documentationUrl,
      demoUrl,
      architectureOverview,
      architectureDiagramUrl,
      technicalDecisions: technicalDecisions ?? [],
      challenges: challenges ?? [],
      outcomes: outcomes ?? [],
      metrics: metrics ?? [],
      skillIds: skillRes.objectIds ?? [],
      roleIds: roleRes.objectIds ?? [],
      seo: seo ?? undefined,
    };

    const created = await ProjectModel.create(newProjectDoc);
    revalidatePath("/admin/dashboard/projects");
    revalidatePath("/");
    revalidatePath("/cv");
    if (created.slug) {
      revalidatePath(`/projects/${created.slug}`);
    }

    return {
      success: true,
      data: toPlainProject(created.toObject()),
    };
  } catch (error: unknown) {
    if (uploadedKeys.length > 0) {
      await rollbackR2Uploads(uploadedKeys);
    }
    const message = error instanceof Error ? error.message : "Failed to create project";
    return { success: false, error: message };
  }
}

export async function updateProject(
  id: string,
  formData: FormData
): Promise<ActionResult<IProject>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  await connectDB();

  let newUploadedKeys: string[] = [];
  try {
    const parsedId = z.string().min(1).safeParse(id);
    if (!parsedId.success || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid project id" };
    }

    const existingProject = await ProjectModel.findById(parsedId.data).lean<IProject>();
    if (!existingProject) {
      return { success: false, error: "Project not found" };
    }

    // Slug validation and collision check if slug is supplied
    let cleanSlug: string | undefined = undefined;
    if (formData.has("slug")) {
      const rawSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
      const slugErr = await validateSlugFormat(rawSlug);
      if (slugErr) {
        return { success: false, error: slugErr };
      }

      const slugExists = await ProjectModel.exists({
        slug: rawSlug,
        _id: { $ne: parsedId.data },
      });
      if (slugExists) {
        return { success: false, error: `Slug "${rawSlug}" is already in use by another project.` };
      }
      cleanSlug = rawSlug;
    }

    // Validate relationships if present
    let skillObjectIds: mongoose.Types.ObjectId[] | undefined = undefined;
    if (formData.has("skillIds")) {
      const rawSkillIds = parseStringArray(formData.get("skillIds")?.toString() ?? null);
      const skillRes = await validateSkillIds(rawSkillIds);
      if (skillRes.error) {
        return { success: false, error: skillRes.error };
      }
      skillObjectIds = skillRes.objectIds;
    }

    let roleObjectIds: mongoose.Types.ObjectId[] | undefined = undefined;
    if (formData.has("roleIds")) {
      const rawRoleIds = parseStringArray(formData.get("roleIds")?.toString() ?? null);
      const roleRes = await validateRoleIds(rawRoleIds);
      if (roleRes.error) {
        return { success: false, error: roleRes.error };
      }
      roleObjectIds = roleRes.objectIds;
    }

    // R2 image handling
    const existingImages = Array.isArray(existingProject.images) ? existingProject.images : [];
    const keptExistingImages = formData.has("existingImages")
      ? parseStringArray(formData.get("existingImages")?.toString() ?? null).filter((url) => existingImages.includes(url))
      : existingImages;

    const removedImages = existingImages.filter((url) => !keptExistingImages.includes(url));

    const uploadedImages = await uploadImages(getImageFiles(formData));
    newUploadedKeys = uploadedImages.keys;

    const finalImages = [...keptExistingImages, ...uploadedImages.urls];

    // Build update $set and $unset
    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, 1> = {};

    // Legacy fields handling
    if (formData.has("title")) setFields.title = String(formData.get("title")).trim();
    if (formData.has("imageFit")) setFields.imageFit = String(formData.get("imageFit"));
    if (formData.has("isFeatured")) {
      setFields.isFeatured = parseBoolean(formData.get("isFeatured"));
    }
    if (formData.has("displayOrder")) {
      setFields.displayOrder = parseNumber(formData.get("displayOrder"));
    }

    // Optional string fields with clear semantics
    const handleOptionalString = (formKey: string, dbField: string) => {
      if (formData.has(formKey)) {
        const val = String(formData.get(formKey) ?? "").trim();
        if (val.length > 0) {
          setFields[dbField] = val;
        } else {
          unsetFields[dbField] = 1;
        }
      }
    };

    handleOptionalString("githubUrl", "githubUrl");
    handleOptionalString("badge", "badge");
    if (setFields.badge) {
      setFields.badge = normalizeProjectBadgeLabel(String(setFields.badge));
    }

    if (cleanSlug !== undefined) setFields.slug = cleanSlug;
    handleOptionalString("tagline", "tagline");
    handleOptionalString("shortDescription", "shortDescription");
    handleOptionalString("longDescription", "longDescription");
    handleOptionalString("documentationUrl", "documentationUrl");
    handleOptionalString("demoUrl", "demoUrl");
    handleOptionalString("architectureOverview", "architectureOverview");
    handleOptionalString("architectureDiagramUrl", "architectureDiagramUrl");

    if (formData.has("publicationStatus")) {
      setFields.publicationStatus = String(formData.get("publicationStatus"));
    }
    if (formData.has("projectType")) {
      const pType = String(formData.get("projectType") ?? "").trim();
      if (pType) setFields.projectType = pType;
      else unsetFields.projectType = 1;
    }
    if (formData.has("category")) {
      const cat = String(formData.get("category") ?? "").trim();
      if (cat) setFields.category = cat;
      else unsetFields.category = 1;
    }

    // Always update images if images were altered or files uploaded
    setFields.images = finalImages;

    // Subdocuments / Arrays
    if (formData.has("technicalDecisions")) {
      const decs = parseJsonField<ITechnicalDecision[]>(formData.get("technicalDecisions")?.toString() ?? null);
      if (decs && decs.length > 0) setFields.technicalDecisions = decs;
      else setFields.technicalDecisions = [];
    }

    if (formData.has("challenges")) {
      const chs = parseJsonField<ITechnicalChallenge[]>(formData.get("challenges")?.toString() ?? null);
      if (chs && chs.length > 0) setFields.challenges = chs;
      else setFields.challenges = [];
    }

    if (formData.has("outcomes")) {
      const outs = parseJsonField<string[]>(formData.get("outcomes")?.toString() ?? null);
      if (outs && outs.length > 0) setFields.outcomes = outs;
      else setFields.outcomes = [];
    }

    if (formData.has("metrics")) {
      const mets = parseJsonField<IMetric[]>(formData.get("metrics")?.toString() ?? null);
      if (mets && mets.length > 0) setFields.metrics = mets;
      else setFields.metrics = [];
    }

    if (formData.has("seo")) {
      const seoObj = parseJsonField<ISEOOverride>(formData.get("seo")?.toString() ?? null);
      if (seoObj && (seoObj.metaTitle || seoObj.metaDescription || (seoObj.keywords && seoObj.keywords.length > 0))) {
        setFields.seo = seoObj;
      } else {
        unsetFields.seo = 1;
      }
    }

    if (skillObjectIds !== undefined) {
      setFields.skillIds = skillObjectIds;
    }
    if (roleObjectIds !== undefined) {
      setFields.roleIds = roleObjectIds;
    }

    const updateOps: { $set?: Record<string, unknown>; $unset?: Record<string, 1> } = {};
    if (Object.keys(setFields).length > 0) updateOps.$set = setFields;
    if (Object.keys(unsetFields).length > 0) updateOps.$unset = unsetFields;

    const updated = await ProjectModel.findByIdAndUpdate(parsedId.data, updateOps, {
      new: true,
      runValidators: true,
    }).lean<IProject>();

    if (!updated) {
      if (newUploadedKeys.length > 0) {
        await rollbackR2Uploads(newUploadedKeys);
      }
      return { success: false, error: "Project not found" };
    }

    if (removedImages.length > 0) {
      await cleanupObsoleteR2Objects(removedImages);
    }

    revalidatePath("/admin/dashboard/projects");
    revalidatePath("/");
    revalidatePath("/cv");
    if (updated.slug) {
      revalidatePath(`/projects/${updated.slug}`);
    }
    if (existingProject.slug && existingProject.slug !== updated.slug) {
      revalidatePath(`/projects/${existingProject.slug}`);
    }

    return {
      success: true,
      data: toPlainProject(updated),
    };
  } catch (error: unknown) {
    if (newUploadedKeys.length > 0) {
      await rollbackR2Uploads(newUploadedKeys);
    }
    const message = error instanceof Error ? error.message : "Failed to update project";
    return { success: false, error: message };
  }
}

export async function deleteProject(id: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  await connectDB();

  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success || !mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid project id" };
  }

  const projectObjectId = new mongoose.Types.ObjectId(id);
  let imagesToDelete: string[] = [];
  let deletedSlug: string | undefined;

  const dbSession = await mongoose.startSession();
  try {
    dbSession.startTransaction();

    const project = await ProjectModel.findById(id).session(dbSession).lean<IProject>();
    if (!project) {
      await dbSession.abortTransaction();
      return { success: false, error: "Project not found" };
    }

    imagesToDelete = Array.isArray(project.images) ? [...project.images] : [];
    deletedSlug = project.slug;

    // Dependency check for Event references
    const referencingEvents = await EventModel.find({ projectIds: projectObjectId })
      .session(dbSession)
      .select("title")
      .lean();

    // Dependency check for Award references
    const referencingAwards = await AwardModel.find({ relatedProjectId: projectObjectId })
      .session(dbSession)
      .select("title")
      .lean();

    if (referencingEvents.length > 0 || referencingAwards.length > 0) {
      await dbSession.abortTransaction();

      const eventsList = referencingEvents.map((e) => ({ id: String(e._id), title: e.title }));
      const awardsList = referencingAwards.map((a) => ({ id: String(a._id), title: a.title }));

      let blockerMsg = "Cannot delete Project. It is referenced by incoming graph relationships:\n";
      if (eventsList.length > 0) {
        blockerMsg += `- ${eventsList.length} Event(s): ${eventsList.map((e) => `"${e.title}"`).join(", ")}\n`;
      }
      if (awardsList.length > 0) {
        blockerMsg += `- ${awardsList.length} Award(s): ${awardsList.map((a) => `"${a.title}"`).join(", ")}\n`;
      }

      return {
        success: false,
        error: blockerMsg.trim(),
        dependencies: {
          events: eventsList,
          awards: awardsList,
        },
      };
    }

    const deleteRes = await ProjectModel.deleteOne({ _id: id }).session(dbSession);
    if (deleteRes.deletedCount !== 1) {
      await dbSession.abortTransaction();
      return { success: false, error: "Failed to verify Project deletion count." };
    }

    await dbSession.commitTransaction();
  } catch (txErr: unknown) {
    await dbSession.abortTransaction();
    const txMsg = txErr instanceof Error ? txErr.message : "Database transaction error";
    return { success: false, error: `Transaction failed during project deletion: ${txMsg}` };
  } finally {
    dbSession.endSession();
  }

  // Post-commit R2 cleanup
  if (imagesToDelete.length > 0) {
    await cleanupObsoleteR2Objects(imagesToDelete);
  }

  revalidatePath("/admin/dashboard/projects");
  revalidatePath("/");
  revalidatePath("/cv");
  if (deletedSlug) {
    revalidatePath(`/projects/${deletedSlug}`);
  }

  return { success: true, data: null };
}

export async function updateProjectOrder(ids: string[]): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  await connectDB();

  const parsed = z.array(z.string().min(1)).safeParse(ids);
  if (!parsed.success) {
    return { success: false, error: "Invalid project order payload" };
  }

  try {
    await Promise.all(
      parsed.data.map((projectId, index) =>
        ProjectModel.findByIdAndUpdate(projectId, { displayOrder: index }, { runValidators: true })
      )
    );

    revalidatePath("/admin/dashboard/projects");
    revalidatePath("/");
    revalidatePath("/cv");

    return { success: true, data: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update project order";
    return { success: false, error: message };
  }
}
