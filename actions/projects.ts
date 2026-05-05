"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { IProject, ProjectModel } from "@/lib/db/models/Project";
import { normalizeProjectBadgeLabel } from "@/lib/project-badges";
import { projectSchema } from "@/lib/validate";
import { sanitizeObject } from "@/lib/sanitize";
import { deleteFromR2, extractR2Key, uploadToR2 } from "@/lib/r2";
import { auth } from "@/lib/auth";

interface ActionResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}

interface ProjectPayload {
  title: string;
  description: string;
  bullets: string[];
  tags: string[];
  images: string[];
  liveUrl?: string;
  githubUrl?: string;
  badge?: string;
  featured: boolean;
  order: number;
}

function toPlainProject<T>(project: T): T {
  return JSON.parse(JSON.stringify(project)) as T;
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

async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const uploadResults = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = sanitizeFilename(file.name || "image");
      const key = `projects/${Date.now()}-${randomUUID()}-${safeName}`;

      return uploadToR2(buffer, key, file.type || "application/octet-stream");
    })
  );

  return uploadResults;
}

function getImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function buildProjectPayload(formData: FormData, images: string[]): ProjectPayload {
  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    bullets: parseStringArray(formData.get("bullets")?.toString() ?? null),
    tags: parseStringArray(formData.get("tags")?.toString() ?? null),
    images,
    liveUrl: String(formData.get("liveUrl") ?? ""),
    githubUrl: String(formData.get("githubUrl") ?? ""),
    badge: String(formData.get("badge") ?? ""),
    featured: parseBoolean(formData.get("featured")),
    order: parseNumber(formData.get("order")),
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid project data");
  }

  const sanitized = sanitizeObject(parsed.data);

  return {
    ...sanitized,
    liveUrl: normalizeOptionalString(sanitized.liveUrl),
    githubUrl: normalizeOptionalString(sanitized.githubUrl),
    badge: normalizeProjectBadgeLabel(sanitized.badge),
  };
}

export async function getProjects(): Promise<IProject[]> {
  const projects = await ProjectModel.find({}).sort({ order: 1 }).lean();
  return toPlainProject(projects);
}

export async function createProject(formData: FormData): Promise<ActionResult<IProject>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const imageFiles = getImageFiles(formData);
    const uploadedImages = await uploadImages(imageFiles);
    const payload = buildProjectPayload(formData, uploadedImages);

    const created = await ProjectModel.create(payload);
    revalidatePath("/admin/dashboard/projects");
    revalidatePath("/");

    return {
      success: true,
      data: toPlainProject(created.toObject()),
    };
  } catch (error: unknown) {
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

  try {
    const parsedId = z.string().min(1).safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "Invalid project id" };
    }

    const existingProject = await ProjectModel.findById(parsedId.data).lean();
    if (!existingProject) {
      return { success: false, error: "Project not found" };
    }

    const existingImages = Array.isArray(existingProject.images) ? existingProject.images : [];
    const keptExistingImages = parseStringArray(
      formData.get("existingImages")?.toString() ?? null
    ).filter((url) => existingImages.includes(url));

    const removedImages = existingImages.filter((url) => !keptExistingImages.includes(url));
    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map(async (url) => {
          try {
            await deleteFromR2(extractR2Key(url));
          } catch {
            // Ignore delete errors for missing/stale files in storage.
          }
        })
      );
    }

    const uploadedImages = await uploadImages(getImageFiles(formData));
    const finalImages = [...keptExistingImages, ...uploadedImages];
    const payload = buildProjectPayload(formData, finalImages);

    const updated = await ProjectModel.findByIdAndUpdate(parsedId.data, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return { success: false, error: "Project not found" };
    }

    revalidatePath("/admin/dashboard/projects");
    revalidatePath("/");

    return {
      success: true,
      data: toPlainProject(updated),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update project";
    return { success: false, error: message };
  }
}

export async function deleteProject(id: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const parsedId = z.string().min(1).safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "Invalid project id" };
    }

    const project = await ProjectModel.findById(parsedId.data).lean();
    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (Array.isArray(project.images) && project.images.length > 0) {
      await Promise.all(
        project.images.map(async (url) => {
          try {
            await deleteFromR2(extractR2Key(url));
          } catch {
            // Ignore delete errors for missing/stale files in storage.
          }
        })
      );
    }

    await ProjectModel.findByIdAndDelete(parsedId.data);

    revalidatePath("/admin/dashboard/projects");
    revalidatePath("/");

    return { success: true, data: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete project";
    return { success: false, error: message };
  }
}

export async function updateProjectOrder(ids: string[]): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = z.array(z.string().min(1)).safeParse(ids);
  if (!parsed.success) {
    return { success: false, error: "Invalid project order payload" };
  }

  try {
    await Promise.all(
      parsed.data.map((projectId, index) =>
        ProjectModel.findByIdAndUpdate(projectId, { order: index }, { runValidators: true })
      )
    );

    revalidatePath("/admin/dashboard/projects");
    revalidatePath("/");

    return { success: true, data: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update project order";
    return { success: false, error: message };
  }
}
