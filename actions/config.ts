"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongo";
import {
  SiteConfigModel,
  DEFAULT_SITE_CONFIG,
  type IAchievement,
  type ISkillGroup,
} from "@/lib/db/models/SiteConfig";
import { escapeHTML, sanitizeObject } from "@/lib/sanitize";
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
    certifications: { name: string; issuer: string }[];
  };
}

// ─── Get ──────────────────────────────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfigPlain> {
  await connectDB();
  const doc = await SiteConfigModel.findOne({ key: "main" }).lean();

  if (!doc) {
    return JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG)) as SiteConfigPlain;
  }

  return JSON.parse(
    JSON.stringify({
      hero: doc.hero,
      about: doc.about,
    })
  ) as SiteConfigPlain;
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

  const clean = {
    tagline: escapeHTML(parsed.data.tagline),
    typewriterStrings: parsed.data.typewriterStrings.map((s) => escapeHTML(s)),
  };

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
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = aboutConfigSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const clean = {
    bio: escapeHTML(parsed.data.bio),
    certifications: parsed.data.certifications.map((c) =>
      sanitizeObject({ name: c.name, issuer: c.issuer })
    ),
  };

  await connectDB();
  await SiteConfigModel.findOneAndUpdate(
    { key: "main" },
    { $set: { "about.bio": clean.bio, "about.certifications": clean.certifications } },
    { upsert: true }
  );

  revalidatePath("/");
  return { success: true };
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

  const clean = parsed.data.map((a) =>
    sanitizeObject({
      title: a.title,
      event: a.event,
      place: a.place,
      score: a.score ?? "",
      description: a.description ?? "",
      liveUrl: a.liveUrl ?? "",
      githubUrl: a.githubUrl ?? "",
      stack: a.stack,
    })
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

  const clean = parsed.data.map((g) => ({
    category: escapeHTML(g.category),
    items: g.items.map((i) => escapeHTML(i)),
  }));

  await connectDB();
  await SiteConfigModel.findOneAndUpdate(
    { key: "main" },
    { $set: { "about.skills": clean } },
    { upsert: true }
  );

  revalidatePath("/");
  return { success: true };
}
