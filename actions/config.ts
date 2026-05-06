"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongo";
import {
  SiteConfigModel,
  DEFAULT_SITE_CONFIG,
  type IAchievement,
  type ICertification,
  type ISkillGroup,
} from "@/lib/db/models/SiteConfig";
import { decodeLegacyEscapedContent, sanitizeObject } from "@/lib/sanitize";
import { deleteFromR2, extractR2Key, uploadToR2 } from "@/lib/r2";
import {
  heroConfigSchema,
  aboutConfigSchema,
  achievementSchema,
  skillGroupSchema,
} from "@/lib/validate";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface SiteConfigPlain {
  hero: {
    tagline: string;
    typewriterStrings: string[];
  };
  about: {
    bio: string;
    achievements: IAchievement[];
    skills: ISkillGroup[];
    certifications: ICertification[];
  };
}

const CERTIFICATE_MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_CERTIFICATE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function createCertificatePublicId(): string {
  return `cert_${randomBytes(12).toString("hex")}`;
}

function createKeySegment(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalized || "certificate";
}

function normalizeCertificate(certification: ICertification): ICertification {
  return {
    publicId: certification.publicId?.trim() || createCertificatePublicId(),
    name: certification.name,
    issuer: certification.issuer,
    imageUrl: certification.imageUrl?.trim() || undefined,
  };
}

async function uploadCertificateImage(file: File, certification: ICertification): Promise<string> {
  if (!ALLOWED_CERTIFICATE_IMAGE_TYPES.has(file.type)) {
    throw new Error("Certificate image must be a JPG, PNG, WebP, or AVIF file");
  }

  if (file.size > CERTIFICATE_MAX_FILE_SIZE) {
    throw new Error("Certificate image must be 5MB or smaller");
  }

  const publicId = certification.publicId?.trim() || createCertificatePublicId();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const key = `certificates/${publicId}-${createKeySegment(certification.name)}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadToR2(buffer, key, file.type);
}

async function ensureCertificateIds(certifications: ICertification[]): Promise<ICertification[]> {
  const normalized = certifications.map(normalizeCertificate);
  const hasChanges = normalized.some(
    (certification, index) => certification.publicId !== certifications[index]?.publicId
  );

  if (hasChanges) {
    await SiteConfigModel.findOneAndUpdate(
      { key: "main" },
      { $set: { "about.certifications": normalized } },
      { upsert: true }
    );
  }

  return normalized;
}

// ─── Get ──────────────────────────────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfigPlain> {
  await connectDB();
  const doc = await SiteConfigModel.findOne({ key: "main" }).lean();

  if (!doc) {
    return JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG)) as SiteConfigPlain;
  }

  const certifications = await ensureCertificateIds(
    ((doc.about?.certifications as ICertification[] | undefined) ?? []).map((certification) => ({
      publicId: certification.publicId,
      name: certification.name,
      issuer: certification.issuer,
      imageUrl: certification.imageUrl,
    }))
  );

  return decodeLegacyEscapedContent(
    JSON.parse(
      JSON.stringify({
        hero: doc.hero,
        about: {
          ...doc.about,
          certifications,
        },
      })
    ) as SiteConfigPlain
  );
}

export async function getCertificateByPublicId(publicId: string): Promise<ICertification | null> {
  const siteConfig = await getSiteConfig();
  return (
    siteConfig.about.certifications.find(
      (certification) => certification.publicId === publicId
    ) ?? null
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export async function updateHero(
  data: unknown
): Promise<ActionResult<SiteConfigPlain["hero"]>> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = heroConfigSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const clean = sanitizeObject({
    tagline: parsed.data.tagline,
    typewriterStrings: parsed.data.typewriterStrings,
  });

  await connectDB();
  await SiteConfigModel.findOneAndUpdate(
    { key: "main" },
    { $set: { hero: clean } },
    { upsert: true }
  );

  revalidatePath("/");
  return { success: true, data: clean };
}

// ─── About (bio + certifications) ────────────────────────────────────────────

export async function updateAbout(
  data: FormData
): Promise<ActionResult<SiteConfigPlain["about"]>> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const bio = data.get("bio");
  const certificationsRaw = data.get("certifications");

  if (typeof bio !== "string" || typeof certificationsRaw !== "string") {
    return { success: false, error: "Invalid form payload" };
  }

  let certificationsData: unknown;
  try {
    certificationsData = JSON.parse(certificationsRaw);
  } catch {
    return { success: false, error: "Invalid certificate data" };
  }

  const parsed = aboutConfigSchema.safeParse({
    bio,
    certifications: certificationsData,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const existingDoc = await SiteConfigModel.findOne({ key: "main" }).lean();
  const existingCertifications =
    ((existingDoc?.about?.certifications as ICertification[] | undefined) ?? []).map((certification) => ({
      publicId: certification.publicId,
      name: certification.name,
      issuer: certification.issuer,
      imageUrl: certification.imageUrl,
    }));
  const existingImageUrls = new Set(
    existingCertifications
      .map((certification) => certification.imageUrl)
      .filter((value): value is string => Boolean(value))
  );

  const preparedCertifications: ICertification[] = [];

  for (const [index, certification] of parsed.data.certifications.entries()) {
    const publicId = certification.publicId?.trim() || createCertificatePublicId();
    const existing = existingCertifications.find((item) => item.publicId === publicId);
    const imageField = data.get(`certificateImage_${index}`);
    const hasNewImage = imageField instanceof File && imageField.size > 0;

    let imageUrl = certification.removeImage
      ? ""
      : certification.imageUrl?.trim() || existing?.imageUrl || "";

    if (hasNewImage) {
      try {
        imageUrl = await uploadCertificateImage(imageField, {
          publicId,
          name: certification.name,
          issuer: certification.issuer,
        });
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to upload certificate image",
        };
      }
    }

    preparedCertifications.push({
      publicId,
      name: certification.name,
      issuer: certification.issuer,
      imageUrl: imageUrl || undefined,
    });
  }

  const clean = sanitizeObject({
    bio: parsed.data.bio,
    certifications: preparedCertifications,
  });

  await SiteConfigModel.findOneAndUpdate(
    { key: "main" },
    { $set: { "about.bio": clean.bio, "about.certifications": clean.certifications } },
    { upsert: true }
  );

  const nextImageUrls = new Set(
    clean.certifications
      .map((certification) => certification.imageUrl)
      .filter((value): value is string => Boolean(value))
  );

  const urlsToDelete = [...existingImageUrls].filter((url) => !nextImageUrls.has(url));
  await Promise.allSettled(
    urlsToDelete.map((url) => deleteFromR2(extractR2Key(url)))
  );

  revalidatePath("/");
  return {
    success: true,
    data: {
      bio: clean.bio,
      achievements: decodeLegacyEscapedContent(
        JSON.parse(JSON.stringify(existingDoc?.about?.achievements ?? DEFAULT_SITE_CONFIG.about.achievements))
      ) as IAchievement[],
      skills: decodeLegacyEscapedContent(
        JSON.parse(JSON.stringify(existingDoc?.about?.skills ?? DEFAULT_SITE_CONFIG.about.skills))
      ) as ISkillGroup[],
      certifications: clean.certifications,
    },
  };
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function updateAchievements(
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = achievementSchema.array().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const clean = sanitizeObject(
    parsed.data.map((a) => ({
      title: a.title,
      event: a.event,
      place: a.place,
      score: a.score ?? "",
      description: a.description ?? "",
      liveUrl: a.liveUrl ?? "",
      githubUrl: a.githubUrl ?? "",
      stack: a.stack,
    }))
  );

  await connectDB();
  await SiteConfigModel.findOneAndUpdate(
    { key: "main" },
    { $set: { "about.achievements": clean } },
    { upsert: true }
  );

  revalidatePath("/");
  return { success: true };
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export async function updateSkills(
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = skillGroupSchema.array().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const clean = sanitizeObject(parsed.data.map((g) => ({
    category: g.category,
    items: g.items,
  })));

  await connectDB();
  await SiteConfigModel.findOneAndUpdate(
    { key: "main" },
    { $set: { "about.skills": clean } },
    { upsert: true }
  );

  revalidatePath("/");
  return { success: true };
}
