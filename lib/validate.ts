import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Project ───────────────────────────────────────────────────────────────────

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  bullets: z.array(z.string()),
  tags: z.array(z.string()),
  images: z.array(z.string()),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  badge: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

// ── Win ───────────────────────────────────────────────────────────────────────

export const winSchema = z.object({
  title: z.string().min(1, "Title is required"),
  event: z.string().min(1, "Event is required"),
  place: z.string().min(1, "Place is required"),
  score: z.string().optional(),
  date: z.coerce.date(),
  description: z.string().optional(),
  stack: z.array(z.string()).optional(),
});

// ── Resume ────────────────────────────────────────────────────────────────────

export const resumeSchema = z.object({
  label: z.string().min(1, "Label is required"),
  fileUrl: z.string().url("Must be a valid URL"),
});

// ── Site Config ───────────────────────────────────────────────────────────────

export const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  event: z.string().min(1, "Event is required"),
  place: z.string().min(1, "Place is required"),
  score: z.string().optional(),
  description: z.string().optional(),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stack: z.array(z.string()).default([]),
});

export const skillGroupSchema = z.object({
  category: z.string().min(1, "Category is required"),
  items: z.array(z.string()).default([]),
});

export const certificationSchema = z.object({
  publicId: z.string().min(1).optional().or(z.literal("")),
  name: z.string().min(1, "Name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  removeImage: z.boolean().optional().default(false),
});

export const heroConfigSchema = z.object({
  tagline: z.string().min(1, "Tagline is required"),
  typewriterStrings: z.array(z.string().min(1)).min(1, "At least one string required"),
});

export const aboutConfigSchema = z.object({
  bio: z.string().min(1, "Bio is required"),
  certifications: z.array(certificationSchema),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type WinInput = z.infer<typeof winSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type SkillGroupInput = z.infer<typeof skillGroupSchema>;
export type HeroConfigInput = z.infer<typeof heroConfigSchema>;
export type AboutConfigInput = z.infer<typeof aboutConfigSchema>;
