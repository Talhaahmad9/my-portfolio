"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { IResume, ResumeModel } from "@/lib/db/models/Resume";
import {
  cleanupObsoleteR2Objects,
  rollbackR2Uploads,
  uploadToR2,
} from "@/lib/r2";
import { resumeSchema } from "@/lib/validate";

interface ActionResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}

function toPlainResume<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sanitizeLabelForKey(label: string): string {
  const safe = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safe.length > 0 ? safe : "resume";
}

export async function getActiveResume(): Promise<IResume | null> {
  const resume = await ResumeModel.findOne({ isActive: true }).lean();
  if (!resume) {
    return null;
  }

  return toPlainResume(resume);
}

export async function getAllResumes(): Promise<IResume[]> {
  const resumes = await ResumeModel.find({}).sort({ uploadedAt: -1 }).lean();
  return toPlainResume(resumes);
}

export async function uploadResume(formData: FormData): Promise<ActionResult<IResume>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const label = String(formData.get("label") ?? "").trim();
  const fileEntry = formData.get("file");

  const labelParse = z.string().min(1, "Label is required").safeParse(label);
  if (!labelParse.success) {
    return { success: false, error: labelParse.error.issues[0]?.message ?? "Invalid label" };
  }

  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return { success: false, error: "Resume PDF is required" };
  }

  if (fileEntry.type !== "application/pdf") {
    return { success: false, error: "Only PDF files are allowed" };
  }

  const maxBytes = 10 * 1024 * 1024;
  if (fileEntry.size > maxBytes) {
    return { success: false, error: "File size must be 10MB or less" };
  }

  let uploadedKey: string | null = null;
  try {
    const key = `resumes/${Date.now()}-${sanitizeLabelForKey(labelParse.data)}.pdf`;
    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const uploaded = await uploadToR2(buffer, key, "application/pdf");
    uploadedKey = uploaded.key;

    const parsedResume = resumeSchema.safeParse({
      label: labelParse.data,
      fileUrl: uploaded.url,
    });

    if (!parsedResume.success) {
      if (uploadedKey) {
        await rollbackR2Uploads([uploadedKey]);
      }
      return {
        success: false,
        error: parsedResume.error.issues[0]?.message ?? "Invalid resume data",
      };
    }

    const created = await ResumeModel.create({
      ...parsedResume.data,
      isActive: false,
    });

    revalidatePath("/admin/dashboard/resume");
    revalidatePath("/");
    revalidatePath("/cv");

    return { success: true, data: toPlainResume(created.toObject()) as IResume };
  } catch (error: unknown) {
    if (uploadedKey) {
      await rollbackR2Uploads([uploadedKey]);
    }
    const message = error instanceof Error ? error.message : "Failed to upload resume";
    return { success: false, error: message };
  }
}

export async function setActiveResume(id: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsedId = z.string().min(1, "Invalid resume id").safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? "Invalid resume id" };
  }

  try {
    const targetResume = await ResumeModel.findById(parsedId.data).lean();
    if (!targetResume) {
      return { success: false, error: "Resume not found" };
    }

    if (targetResume.isActive) {
      return { success: true, data: null };
    }

    await ResumeModel.updateMany({ _id: { $ne: targetResume._id } }, { isActive: false });
    await ResumeModel.findByIdAndUpdate(targetResume._id, { isActive: true });

    revalidatePath("/admin/dashboard/resume");
    revalidatePath("/");
    revalidatePath("/cv");

    return { success: true, data: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to set active resume";
    return { success: false, error: message };
  }
}

export async function deleteResume(id: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsedId = z.string().min(1, "Invalid resume id").safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? "Invalid resume id" };
  }

  try {
    const resume = await ResumeModel.findById(parsedId.data).lean();
    if (!resume) {
      return { success: false, error: "Resume not found" };
    }

    const fileUrlToDelete = resume.fileUrl;

    const deleted = await ResumeModel.findByIdAndDelete(parsedId.data).lean();
    if (!deleted) {
      return { success: false, error: "Resume not found" };
    }

    if (fileUrlToDelete) {
      await cleanupObsoleteR2Objects([fileUrlToDelete]);
    }

    revalidatePath("/admin/dashboard/resume");
    revalidatePath("/");
    revalidatePath("/cv");

    return { success: true, data: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete resume";
    return { success: false, error: message };
  }
}
