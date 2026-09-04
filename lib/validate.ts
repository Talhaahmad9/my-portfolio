import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Project ───────────────────────────────────────────────────────────────────

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  images: z.array(z.string()),
  imageFit: z.enum(["cover", "contain"]).default("cover"),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  badge: z.string().optional(),
});



// ── Resume ────────────────────────────────────────────────────────────────────

export const resumeSchema = z.object({
  label: z.string().min(1, "Label is required"),
  fileUrl: z.string().url("Must be a valid URL"),
});



export const certificationSchema = z.object({
  publicId: z.string().min(1).optional().or(z.literal("")),
  name: z.string().min(1, "Name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  removeImage: z.boolean().optional().default(false),
});



// ── Inferred types ────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
