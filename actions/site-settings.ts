"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";
import { connectDB } from "@/lib/db/mongo";
import { SiteSettingsModel, ISiteSettings } from "@/lib/db/models/SiteSettings";

// ─── ZOD SCHEMAS FOR SECTION VALIDATION ────────────────────────────────────────

const identitySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  headline: z.string().trim().min(1, "Headline is required"),
  location: z.string().trim().min(1, "Location is required"),
  avatarUrl: z.string().trim().optional(),
  statusBadgeText: z.string().trim().optional(),
});

const heroSchema = z.object({
  greeting: z.string().trim().min(1, "Greeting is required"),
  title: z.string().trim().min(1, "Title is required"),
  subtitle: z.string().trim().min(1, "Subtitle is required"),
  ctaPrimaryText: z.string().trim().min(1, "Primary CTA text is required"),
  ctaPrimaryHref: z.string().trim().min(1, "Primary CTA link is required"),
  ctaSecondaryText: z.string().trim().min(1, "Secondary CTA text is required"),
  ctaSecondaryHref: z.string().trim().min(1, "Secondary CTA link is required"),
});

const aboutSchema = z.object({
  bioParagraphs: z.array(z.string()),
  corePillars: z.array(z.string()),
});

const contactSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  availabilityStatus: z.string().trim().min(1, "Availability status is required"),
  preferredMethod: z.string().trim().min(1, "Preferred contact method is required"),
});

const socialItemSchema = z.object({
  platform: z.string().trim().min(1, "Platform is required"),
  url: z.string().trim().url("Invalid URL format"),
  label: z.string().trim().optional(),
  enabled: z.boolean(),
  displayOrder: z.number().int().default(0),
});

const navigationItemSchema = z.object({
  label: z.string().trim().min(1, "Navigation label is required"),
  href: z.string().trim().min(1, "Navigation link is required"),
  order: z.number().int().default(0),
  enabled: z.boolean(),
});

const footerSchema = z.object({
  copyrightText: z.string().trim().min(1, "Copyright text is required"),
  tagline: z.string().trim().optional(),
});

const seoSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  ogImageUrl: z.string().trim().optional(),
  noIndex: z.boolean().default(false),
});

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

function parseStringArray(input: string | null | undefined): string[] {
  if (!input) return [];
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0);
    }
  } catch {
    // If raw newline-separated string
    return input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
  return [];
}

async function verifySingletonExists(): Promise<{ success: true; doc: ISiteSettings } | { success: false; error: string }> {
  const doc = await SiteSettingsModel.findOne({ key: "main" });
  if (!doc) {
    return {
      success: false,
      error: "Canonical SiteSettings singleton document with key \"main\" is missing from the database.",
    };
  }
  return { success: true, doc };
}

function revalidateAdminRoutes() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/site-content");
  revalidatePath("/admin/dashboard/settings");
  revalidatePath("/admin/dashboard/seo");
}

// ─── SECTION ACTIONS ───────────────────────────────────────────────────────────

export async function updateSiteIdentity(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const singletonRes = await verifySingletonExists();
  if (!singletonRes.success) {
    return { success: false, error: singletonRes.error };
  }

  const rawData = {
    fullName: formData.get("fullName")?.toString() ?? "",
    headline: formData.get("headline")?.toString() ?? "",
    location: formData.get("location")?.toString() ?? "",
    avatarUrl: formData.get("avatarUrl")?.toString() || undefined,
    statusBadgeText: formData.get("statusBadgeText")?.toString() || undefined,
  };

  const parseRes = identitySchema.safeParse(rawData);
  if (!parseRes.success) {
    return { success: false, error: parseRes.error.issues[0]?.message || "Invalid identity input" };
  }

  const data = parseRes.data;
  const setFields: Record<string, unknown> = {
    "identity.fullName": data.fullName,
    "identity.headline": data.headline,
    "identity.location": data.location,
  };
  const unsetFields: Record<string, 1> = {};

  if (data.avatarUrl && data.avatarUrl.trim()) {
    setFields["identity.avatarUrl"] = data.avatarUrl.trim();
  } else {
    unsetFields["identity.avatarUrl"] = 1;
  }

  if (data.statusBadgeText && data.statusBadgeText.trim()) {
    setFields["identity.statusBadgeText"] = data.statusBadgeText.trim();
  } else {
    unsetFields["identity.statusBadgeText"] = 1;
  }

  const updateOp: Record<string, unknown> = { $set: setFields };
  if (Object.keys(unsetFields).length > 0) {
    updateOp.$unset = unsetFields;
  }

  const updateRes = await SiteSettingsModel.updateOne({ key: "main" }, updateOp, { upsert: false });
  if (updateRes.matchedCount === 0) {
    return { success: false, error: "SiteSettings singleton document not found." };
  }

  revalidateAdminRoutes();
  revalidatePath("/");
  revalidatePath("/cv");
  return { success: true };
}

export async function updateSiteHero(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const singletonRes = await verifySingletonExists();
  if (!singletonRes.success) {
    return { success: false, error: singletonRes.error };
  }

  const rawData = {
    greeting: formData.get("greeting")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    subtitle: formData.get("subtitle")?.toString() ?? "",
    ctaPrimaryText: formData.get("ctaPrimaryText")?.toString() ?? "",
    ctaPrimaryHref: formData.get("ctaPrimaryHref")?.toString() ?? "",
    ctaSecondaryText: formData.get("ctaSecondaryText")?.toString() ?? "",
    ctaSecondaryHref: formData.get("ctaSecondaryHref")?.toString() ?? "",
  };

  const parseRes = heroSchema.safeParse(rawData);
  if (!parseRes.success) {
    return { success: false, error: parseRes.error.issues[0]?.message || "Invalid hero input" };
  }

  const updateRes = await SiteSettingsModel.updateOne(
    { key: "main" },
    { $set: { hero: parseRes.data } },
    { upsert: false }
  );

  if (updateRes.matchedCount === 0) {
    return { success: false, error: "SiteSettings singleton document not found." };
  }

  revalidateAdminRoutes();
  revalidatePath("/");
  revalidatePath("/cv");
  return { success: true };
}

export async function updateSiteAbout(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const singletonRes = await verifySingletonExists();
  if (!singletonRes.success) {
    return { success: false, error: singletonRes.error };
  }

  const bioParagraphs = parseStringArray(formData.get("bioParagraphs")?.toString());
  const corePillars = parseStringArray(formData.get("corePillars")?.toString());

  const parseRes = aboutSchema.safeParse({ bioParagraphs, corePillars });
  if (!parseRes.success) {
    return { success: false, error: parseRes.error.issues[0]?.message || "Invalid about input" };
  }

  const updateRes = await SiteSettingsModel.updateOne(
    { key: "main" },
    { $set: { about: parseRes.data } },
    { upsert: false }
  );

  if (updateRes.matchedCount === 0) {
    return { success: false, error: "SiteSettings singleton document not found." };
  }

  revalidateAdminRoutes();
  revalidatePath("/");
  revalidatePath("/cv");
  return { success: true };
}

export async function updateSiteContact(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const singletonRes = await verifySingletonExists();
  if (!singletonRes.success) {
    return { success: false, error: singletonRes.error };
  }

  const rawData = {
    email: formData.get("email")?.toString() ?? "",
    availabilityStatus: formData.get("availabilityStatus")?.toString() ?? "",
    preferredMethod: formData.get("preferredMethod")?.toString() ?? "",
  };

  const parseRes = contactSchema.safeParse(rawData);
  if (!parseRes.success) {
    return { success: false, error: parseRes.error.issues[0]?.message || "Invalid contact input" };
  }

  const updateRes = await SiteSettingsModel.updateOne(
    { key: "main" },
    { $set: { contact: parseRes.data } },
    { upsert: false }
  );

  if (updateRes.matchedCount === 0) {
    return { success: false, error: "SiteSettings singleton document not found." };
  }

  revalidateAdminRoutes();
  revalidatePath("/");
  revalidatePath("/cv");
  return { success: true };
}

export async function updateSiteSocials(socialsJson: string) {
  await requireAdmin();
  await connectDB();

  const singletonRes = await verifySingletonExists();
  if (!singletonRes.success) {
    return { success: false, error: singletonRes.error };
  }

  let rawList: unknown[] = [];
  try {
    rawList = JSON.parse(socialsJson);
    if (!Array.isArray(rawList)) {
      return { success: false, error: "Social links must be an array" };
    }
  } catch {
    return { success: false, error: "Invalid JSON for social links" };
  }

  const validatedList = [];
  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    const parseRes = socialItemSchema.safeParse(item);
    if (!parseRes.success) {
      return {
        success: false,
        error: `Social item #${i + 1} is invalid: ${parseRes.error.issues[0]?.message}`,
      };
    }
    validatedList.push(parseRes.data);
  }

  const updateRes = await SiteSettingsModel.updateOne(
    { key: "main" },
    { $set: { socials: validatedList } },
    { upsert: false }
  );

  if (updateRes.matchedCount === 0) {
    return { success: false, error: "SiteSettings singleton document not found." };
  }

  revalidateAdminRoutes();
  revalidatePath("/");
  revalidatePath("/cv");
  return { success: true };
}

export async function updateSiteNavigation(navigationJson: string) {
  await requireAdmin();
  await connectDB();

  const singletonRes = await verifySingletonExists();
  if (!singletonRes.success) {
    return { success: false, error: singletonRes.error };
  }

  let rawList: unknown[] = [];
  try {
    rawList = JSON.parse(navigationJson);
    if (!Array.isArray(rawList)) {
      return { success: false, error: "Navigation links must be an array" };
    }
  } catch {
    return { success: false, error: "Invalid JSON for navigation links" };
  }

  const validatedList = [];
  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    const parseRes = navigationItemSchema.safeParse(item);
    if (!parseRes.success) {
      return {
        success: false,
        error: `Navigation item #${i + 1} is invalid: ${parseRes.error.issues[0]?.message}`,
      };
    }
    validatedList.push(parseRes.data);
  }

  const updateRes = await SiteSettingsModel.updateOne(
    { key: "main" },
    { $set: { navigation: validatedList } },
    { upsert: false }
  );

  if (updateRes.matchedCount === 0) {
    return { success: false, error: "SiteSettings singleton document not found." };
  }

  revalidateAdminRoutes();
  return { success: true };
}

export async function updateSiteFooter(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const singletonRes = await verifySingletonExists();
  if (!singletonRes.success) {
    return { success: false, error: singletonRes.error };
  }

  const rawData = {
    copyrightText: formData.get("copyrightText")?.toString() ?? "",
    tagline: formData.get("tagline")?.toString() || undefined,
  };

  const parseRes = footerSchema.safeParse(rawData);
  if (!parseRes.success) {
    return { success: false, error: parseRes.error.issues[0]?.message || "Invalid footer input" };
  }

  const data = parseRes.data;
  const setFields: Record<string, unknown> = {
    "footer.copyrightText": data.copyrightText,
  };
  const unsetFields: Record<string, 1> = {};

  if (data.tagline && data.tagline.trim()) {
    setFields["footer.tagline"] = data.tagline.trim();
  } else {
    unsetFields["footer.tagline"] = 1;
  }

  const updateOp: Record<string, unknown> = { $set: setFields };
  if (Object.keys(unsetFields).length > 0) {
    updateOp.$unset = unsetFields;
  }

  const updateRes = await SiteSettingsModel.updateOne({ key: "main" }, updateOp, { upsert: false });
  if (updateRes.matchedCount === 0) {
    return { success: false, error: "SiteSettings singleton document not found." };
  }

  revalidateAdminRoutes();
  revalidatePath("/");
  revalidatePath("/cv");
  return { success: true };
}

export async function updateSiteSeo(formData: FormData) {
  await requireAdmin();
  await connectDB();

  const singletonRes = await verifySingletonExists();
  if (!singletonRes.success) {
    return { success: false, error: singletonRes.error };
  }

  const isClear = formData.get("clearSeo") === "true";
  if (isClear) {
    const updateRes = await SiteSettingsModel.updateOne(
      { key: "main" },
      { $unset: { seo: 1 } },
      { upsert: false }
    );
    if (updateRes.matchedCount === 0) {
      return { success: false, error: "SiteSettings singleton document not found." };
    }
    revalidateAdminRoutes();
    revalidatePath("/");
    revalidatePath("/cv");
    return { success: true };
  }

  const rawData = {
    title: formData.get("title")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    ogImageUrl: formData.get("ogImageUrl")?.toString() || undefined,
    noIndex: formData.get("noIndex") === "true",
  };

  const parseRes = seoSchema.safeParse(rawData);
  if (!parseRes.success) {
    return { success: false, error: parseRes.error.issues[0]?.message || "Invalid SEO input" };
  }

  const data = parseRes.data;
  // If title, description, and ogImageUrl are all empty/undefined, unset SEO subdocument
  if (!data.title && !data.description && !data.ogImageUrl && !data.noIndex) {
    const updateRes = await SiteSettingsModel.updateOne(
      { key: "main" },
      { $unset: { seo: 1 } },
      { upsert: false }
    );
    if (updateRes.matchedCount === 0) {
      return { success: false, error: "SiteSettings singleton document not found." };
    }
    revalidateAdminRoutes();
    revalidatePath("/");
    revalidatePath("/cv");
    return { success: true };
  }

  const updateRes = await SiteSettingsModel.updateOne(
    { key: "main" },
    { $set: { seo: data } },
    { upsert: false }
  );

  if (updateRes.matchedCount === 0) {
    return { success: false, error: "SiteSettings singleton document not found." };
  }

  revalidateAdminRoutes();
  revalidatePath("/");
  revalidatePath("/cv");
  return { success: true };
}
